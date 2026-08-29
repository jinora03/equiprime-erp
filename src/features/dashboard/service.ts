import { approvalService } from "@/features/approvals/service";
import { equipmentService } from "@/features/equipment/service";
import { inventoryService } from "@/features/inventory/service";
import { isLowStock, LOW_STOCK_AVAILABLE_THRESHOLD } from "@/features/inventory/types";
import { jobOrderService } from "@/features/job-orders/service";
import { maintenanceService } from "@/features/maintenance/service";
import { partsRequestService } from "@/features/parts/service";
import { workItemService } from "@/features/work-items/service";
import { revenueSeed } from "@/services/mock/revenue-data";
import { organizationService } from "@/services/organization.service";
import { workflowService } from "@/services/workflow.service";
import type { OrganizationScope, Workflow } from "@/types";
import {
  CHART_COLORS,
  type Activity,
  type DashboardSnapshot,
  type JobOrderStatus,
} from "./data";
import { deriveServiceMetrics, detectBottlenecks } from "./service-metrics";

const MONTH_FORMATTER = new Intl.DateTimeFormat("en", {
  month: "short",
  timeZone: "UTC",
});

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const DAY_MS = 24 * 60 * 60 * 1_000;

function jobOrderStatus(stageId: string): JobOrderStatus {
  if (stageId === "jo-completed" || stageId === "jo-closed") return "Completed";
  if (stageId === "jo-waiting-parts") return "On Hold";
  if (["jo-draft", "jo-submitted", "jo-approved"].includes(stageId)) {
    return "Open";
  }
  return "In Progress";
}

function percentageChange(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function daysPastDue(date: string, today: string): number {
  const due = Date.parse(`${date}T00:00:00Z`);
  const current = Date.parse(`${today}T00:00:00Z`);
  return Math.max(0, Math.floor((current - due) / DAY_MS));
}

function stageName(workflow: Workflow | null, stageId: string): string {
  return workflow?.stages.find((stage) => stage.id === stageId)?.name ?? stageId;
}

function shortDate(value: string): string {
  return SHORT_DATE_FORMATTER.format(new Date(value));
}

export const dashboardService = {
  async get(scope: OrganizationScope): Promise<DashboardSnapshot> {
    const [
      branch,
      jobOrders,
      equipment,
      inventory,
      maintenance,
      partsRequests,
      workItems,
      approvals,
      jobWorkflow,
      maintenanceWorkflow,
    ] = await Promise.all([
      organizationService.getBranch(scope),
      jobOrderService.list(scope),
      equipmentService.list(scope),
      inventoryService.list(scope),
      maintenanceService.list(scope),
      partsRequestService.listForApproval(scope),
      workItemService.list(undefined, scope),
      approvalService.listForDashboard(scope),
      workflowService.getByModule("job-orders"),
      workflowService.getByModule("maintenance"),
    ]);

    const revenue = revenueSeed
      .filter(
        (entry) =>
          entry.companyId === scope.companyId && entry.branchId === scope.branchId,
      )
      .sort((a, b) => a.period.localeCompare(b.period));
    const latestRevenue = revenue.at(-1)?.amount ?? 0;
    const previousRevenue = revenue.at(-2)?.amount ?? 0;

    const equipmentStatus = [
      { name: "In Use", key: "in_use", color: CHART_COLORS.success },
      { name: "Under Service", key: "under_service", color: CHART_COLORS.warning },
      { name: "Idle", key: "idle", color: CHART_COLORS.primary },
      { name: "Decommissioned", key: "decommissioned", color: CHART_COLORS.danger },
    ].map(({ name, key, color }) => ({
      name,
      value: equipment.filter((item) => item.status === key).length,
      color,
    }));

    const today = new Date().toISOString().slice(0, 10);
    const activeJobOrders = jobOrders.filter(
      (job) => !["jo-completed", "jo-closed"].includes(job.currentStageId),
    );
    const overdueJobOrders = activeJobOrders.filter((job) => job.dueDate < today);
    const overdueMaintenance = maintenance.filter(
      (item) => item.currentStageId !== "mt-completed" && item.scheduledDate < today,
    );
    const waitingForParts = activeJobOrders.filter(
      (job) => job.currentStageId === "jo-waiting-parts",
    );
    const lowStockItems = inventory.filter(isLowStock);
    const equipmentInUse = equipment.filter((item) => item.status === "in_use").length;

    const oldestJobOverdueDays = overdueJobOrders.reduce(
      (max, job) => Math.max(max, daysPastDue(job.dueDate, today)),
      0,
    );
    const highPriorityMaintenance = overdueMaintenance.filter(
      (item) => item.priority === "High",
    ).length;
    const waitingSince = waitingForParts
      .flatMap((job) =>
        job.history
          .filter((entry) => entry.toStageId === "jo-waiting-parts")
          .map((entry) => entry.at),
      )
      .sort()[0];

    const attention = [
      {
        key: "overdue_job_orders" as const,
        count: overdueJobOrders.length,
        label: "Job orders overdue",
        detail:
          oldestJobOverdueDays > 0
            ? `Oldest is ${oldestJobOverdueDays} days past due`
            : "Past their scheduled due date",
      },
      {
        key: "overdue_maintenance" as const,
        count: overdueMaintenance.length,
        label: "Maintenance overdue",
        detail:
          highPriorityMaintenance > 0
            ? `${highPriorityMaintenance} high-priority ${highPriorityMaintenance === 1 ? "item" : "items"}`
            : "Outstanding scheduled service",
      },
      {
        key: "waiting_for_parts" as const,
        count: waitingForParts.length,
        label: "Waiting for parts",
        detail: waitingSince
          ? `Oldest waiting since ${shortDate(waitingSince)}`
          : "Parts are blocking service work",
      },
      {
        key: "low_stock_inventory" as const,
        count: lowStockItems.length,
        label: "Low-stock inventory",
        detail: `${lowStockItems.length === 1 ? "1 item has" : `${lowStockItems.length} items have`} ${LOW_STOCK_AVAILABLE_THRESHOLD} or fewer available`,
      },
    ].filter((item) => item.count > 0);

    const serviceMetrics = deriveServiceMetrics({
      jobOrders,
      partsRequests,
      workItems,
    });
    const bottlenecks = detectBottlenecks({
      jobOrders,
      partsRequests,
      workItems,
      approvalTasks: approvals,
    }).slice(0, 8);

    const jobById = new Map(jobOrders.map((job) => [job.id, job]));

    const activity: Activity[] = [
      ...jobOrders.flatMap((job) =>
        job.history.map((entry) => ({
          id: `job-${job.id}-${entry.id}`,
          user: entry.actor,
          verb: entry.fromStageId ? "moved" : "created",
          target: job.code,
          suffix: entry.fromStageId
            ? `to ${stageName(jobWorkflow, entry.toStageId)}`
            : undefined,
          detail: job.title,
          time: entry.at,
          targetKind: "job_order" as const,
          targetId: job.id,
        })),
      ),
      ...maintenance.flatMap((item) =>
        item.history.map((entry) => ({
          id: `maintenance-${item.id}-${entry.id}`,
          user: entry.actor,
          verb: entry.fromStageId ? "moved maintenance" : "scheduled maintenance",
          target: item.code,
          suffix: entry.fromStageId
            ? `to ${stageName(maintenanceWorkflow, entry.toStageId)}`
            : undefined,
          detail: `${item.equipment} · ${item.type}`,
          time: entry.at,
          targetKind: "maintenance" as const,
          targetId: item.id,
        })),
      ),
      ...partsRequests.flatMap((request) => {
        const job = jobById.get(request.jobOrderId);
        const target = job?.code ?? request.code;
        const targetId = job?.id;
        const created: Activity = {
          id: `parts-created-${request.id}`,
          user: request.requestedBy,
          verb: "requested parts for",
          target,
          detail: `${request.code} · ${request.items.length} ${request.items.length === 1 ? "line item" : "line items"}`,
          time: request.createdAt,
          targetKind: targetId ? "job_order_parts" : undefined,
          targetId,
        };

        if (!request.decision) return [created];

        return [
          created,
          {
            id: `parts-decision-${request.id}`,
            user: request.decision.actorName,
            verb:
              request.status === "released"
                ? "released parts for"
                : "rejected parts for",
            target,
            detail: request.code,
            time: request.decision.at,
            targetKind: targetId ? ("job_order_parts" as const) : undefined,
            targetId,
          },
        ];
      }),
    ]
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 7);

    return {
      branchName: branch.displayName,
      region: branch.region,
      currentRevenue: latestRevenue,
      revenueChange: percentageChange(latestRevenue, previousRevenue),
      openJobOrders: activeJobOrders.length,
      overdueJobOrders: overdueJobOrders.length,
      equipmentUnits: equipment.length,
      equipmentUtilization:
        equipment.length > 0 ? Math.round((equipmentInUse / equipment.length) * 100) : 0,
      inventoryOnHand: inventory.reduce((sum, item) => sum + item.onHand, 0),
      lowStockItems: lowStockItems.length,
      attention,
      serviceMetrics,
      bottlenecks,
      revenueTrend: revenue.slice(-6).map((entry) => ({
        month: MONTH_FORMATTER.format(new Date(`${entry.period}-01T00:00:00Z`)),
        value: Number((entry.amount / 1_000_000).toFixed(2)),
      })),
      equipmentStatus,
      recentJobOrders: [...jobOrders]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5)
        .map((job) => ({
          id: job.id,
          code: job.code,
          title: job.title,
          customer: job.customer,
          equipment: job.equipment,
          mechanic: job.assignee || "Unassigned",
          priority: job.priority,
          status: jobOrderStatus(job.currentStageId),
          dueDate: job.dueDate,
          date: job.createdAt,
          overdue:
            !["jo-completed", "jo-closed"].includes(job.currentStageId) &&
            job.dueDate < today,
        })),
      activities: activity,
      upcomingMaintenance: [...maintenance]
        .filter((item) => item.currentStageId !== "mt-completed")
        .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
        .slice(0, 4)
        .map((item) => ({
          id: item.id,
          equipment: item.equipment,
          type: item.type,
          due: item.scheduledDate,
          priority: item.priority,
          overdue: item.scheduledDate < today,
        })),
    };
  },
};
