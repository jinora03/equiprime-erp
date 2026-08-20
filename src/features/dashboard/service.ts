import { equipmentService } from "@/features/equipment/service";
import { inventoryService } from "@/features/inventory/service";
import { jobOrderService } from "@/features/job-orders/service";
import { maintenanceService } from "@/features/maintenance/service";
import { workItemService } from "@/features/work-items/service";
import { revenueSeed } from "@/services/mock/revenue-data";
import { organizationService } from "@/services/organization.service";
import { userService } from "@/services/user.service";
import type { OrganizationScope } from "@/types";
import {
  CHART_COLORS,
  type Activity,
  type DashboardSnapshot,
  type JobOrderStatus,
  type WorkOverviewPoint,
} from "./data";

const MONTH_FORMATTER = new Intl.DateTimeFormat("en", { month: "short" });

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

function buildWorkOverview(
  periods: string[],
  jobOrders: Awaited<ReturnType<typeof jobOrderService.list>>,
  workItems: Awaited<ReturnType<typeof workItemService.list>>,
): WorkOverviewPoint[] {
  return periods.map((period) => ({
    label: MONTH_FORMATTER.format(new Date(`${period}-01T00:00:00Z`)),
    jobOrders: jobOrders.filter((job) => job.createdAt.startsWith(period)).length,
    workItems: workItems.filter((item) => item.createdAt.startsWith(period)).length,
    completed: jobOrders.filter((job) =>
      job.history.some(
        (entry) =>
          entry.toStageId === "jo-completed" && entry.at.startsWith(period),
      ),
    ).length,
  }));
}

export const dashboardService = {
  async get(scope: OrganizationScope): Promise<DashboardSnapshot> {
    const [
      branch,
      jobOrders,
      usersPage,
      equipment,
      inventory,
      maintenance,
      allWorkItems,
    ] = await Promise.all([
      organizationService.getBranch(scope),
      jobOrderService.list(scope),
      userService.list({ page: 1, page_size: 500 }, scope),
      equipmentService.list(scope),
      inventoryService.list(scope),
      maintenanceService.list(scope),
      workItemService.list(undefined, scope),
    ]);

    const jobIds = new Set(jobOrders.map((job) => job.id));
    const workItems = allWorkItems.filter((item) => jobIds.has(item.jobOrderId));
    const revenue = revenueSeed
      .filter(
        (entry) =>
          entry.companyId === scope.companyId && entry.branchId === scope.branchId,
      )
      .sort((a, b) => a.period.localeCompare(b.period));
    const periods = revenue.slice(-6).map((entry) => entry.period);
    const latestRevenue = revenue.at(-1)?.amount ?? 0;
    const previousRevenue = revenue.at(-2)?.amount ?? 0;

    const equipmentStatus = [
      { name: "In Use", key: "in_use", color: CHART_COLORS.success },
      { name: "Under Service", key: "under_service", color: CHART_COLORS.warning },
      { name: "Idle", key: "idle", color: CHART_COLORS.neutral },
      { name: "Decommissioned", key: "decommissioned", color: CHART_COLORS.danger },
    ].map(({ name, key, color }) => ({
      name,
      value: equipment.filter((item) => item.status === key).length,
      color,
    }));

    const activity: Activity[] = [
      ...jobOrders.flatMap((job) =>
        job.history.map((entry) => ({
          id: `job-${job.id}-${entry.id}`,
          user: entry.actor,
          action: entry.fromStageId ? "updated job order" : "created job order",
          target: job.code,
          time: entry.at,
        })),
      ),
      ...workItems.map((item) => ({
        id: `work-${item.id}`,
        user: item.assignee ?? "System",
        action: "updated work item on",
        target: item.jobOrderCode,
        time: item.updatedAt,
      })),
    ]
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 5);

    return {
      branchName: branch.displayName,
      region: branch.region,
      currentRevenue: latestRevenue,
      revenueChange: percentageChange(latestRevenue, previousRevenue),
      openJobOrders: jobOrders.filter(
        (job) => !["jo-completed", "jo-closed"].includes(job.currentStageId),
      ).length,
      equipmentUnits: equipment.length,
      employees: usersPage.total,
      attendanceRate: branch.attendanceRate,
      inventoryOnHand: inventory.reduce((sum, item) => sum + item.onHand, 0),
      workOverview: buildWorkOverview(periods, jobOrders, workItems),
      revenueTrend: revenue.slice(-6).map((entry) => ({
        month: MONTH_FORMATTER.format(
          new Date(`${entry.period}-01T00:00:00Z`),
        ),
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
          status: jobOrderStatus(job.currentStageId),
          date: job.createdAt,
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
        })),
    };
  },
};
