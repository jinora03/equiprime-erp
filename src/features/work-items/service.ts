import type { JobOrder } from "@/features/job-orders/types";
import { delay, nextId } from "@/services/mock/delay";
import {
  requireMockPermission,
  requireMockSessionActor,
} from "@/services/mock/session-context";
import { matchesOrganizationScope } from "@/services/mock/scope";
import { findRegisteredWorkflowRecord } from "@/services/workflow-record-registry";
import {
  canUpdateJobOrder,
  canUpdateWorkItem,
  type ServiceWorkActor,
} from "@/services/service-work-access";
import { userService } from "@/services/user.service";
import { getActiveOrganizationScope } from "@/store/organization.store";
import type { OrganizationScope } from "@/types";
import { workItemSeed } from "./data";
import {
  canTransitionWorkItemStatus,
  getWorkItemStatus,
  type WorkItemStatus,
} from "./statuses";
import type { WorkItem, WorkItemInput } from "./types";

/**
 * WorkItemService — mock repository for a job order's work items. Bespoke (not
 * the workflow record store) because work items use fixed statuses. Swap the
 * `delay()` bodies for ERP API calls later; the hooks + UI stay the same.
 */

const data: WorkItem[] = workItemSeed.map((w) => ({ ...w }));
let counter = workItemSeed.length;

export const workItemService = {
  /** List work items, optionally scoped to a single job order. */
  list(jobOrderId?: number, scope?: OrganizationScope): Promise<WorkItem[]> {
    const rows = data
      .filter(
        (workItem) =>
          matchesOrganizationScope(workItem, scope) &&
          (jobOrderId == null || workItem.jobOrderId === jobOrderId),
      )
      .map((w) => ({ ...w }));
    return delay(rows);
  },

  listAssignedTo(
    userId: number,
    scope?: OrganizationScope,
  ): Promise<WorkItem[]> {
    return delay(
      data
        .filter(
          (workItem) =>
            workItem.assigneeId === userId &&
            matchesOrganizationScope(workItem, scope),
        )
        .map((workItem) => ({ ...workItem })),
    );
  },

  async create(input: WorkItemInput): Promise<WorkItem> {
    const now = new Date().toISOString();
    const session = requireMockPermission("work-items:create");
    const scope = getActiveOrganizationScope();
    const jobOrder = findRegisteredWorkflowRecord<JobOrder>(
      "job-orders",
      input.jobOrderId,
    );
    if (!jobOrder || !matchesOrganizationScope(jobOrder, scope)) {
      throw new Error("Job order not found in the active branch.");
    }
    if (
      !canUpdateJobOrder(
        {
          userId: session.id,
          role: session.role,
          permissions: session.permissions,
        },
        jobOrder,
      )
    ) {
      throw new Error(
        "You can only add work items to job orders available to your account.",
      );
    }

    const mechanics = input.assigneeId
      ? await userService.listMechanics(scope)
      : [];
    const mechanic = input.assigneeId
      ? mechanics.find((candidate) => candidate.id === input.assigneeId)
      : null;
    if (input.assigneeId && !mechanic) {
      throw new Error("Select an active mechanic from this branch.");
    }
    if (input.assigneeId && !jobOrder.assigneeIds.includes(input.assigneeId)) {
      throw new Error("Assign this mechanic to the job order first.");
    }

    counter += 1;
    const record: WorkItem = {
      id: nextId(),
      code: `WI-2026-${String(counter).padStart(4, "0")}`,
      task: input.task,
      jobOrderId: input.jobOrderId,
      jobOrderCode: jobOrder.code,
      companyId: scope.companyId,
      branchId: scope.branchId,
      assigneeId: mechanic?.id ?? null,
      assignee: mechanic?.full_name ?? null,
      priority: input.priority,
      estimatedHours: input.estimatedHours ?? 0,
      actualHours: 0,
      dueDate: input.dueDate ?? "",
      status: "not_started",
      notes: input.notes ?? "",
      createdAt: now,
      updatedAt: now,
    };
    data.unshift(record);
    return delay({ ...record });
  },

  updateStatus(
    id: number,
    status: WorkItemStatus,
  ): Promise<WorkItem> {
    const session = requireMockSessionActor();
    const actor: ServiceWorkActor = {
      userId: session.id,
      role: session.role,
      permissions: session.permissions,
    };
    const record = data.find(
      (workItem) =>
        workItem.id === id && matchesOrganizationScope(workItem),
    );
    if (!record) return Promise.reject(new Error("Work item not found"));
    if (!canUpdateWorkItem(actor, record)) {
      return Promise.reject(
        new Error("You can only update work items available to your account."),
      );
    }
    if (!canTransitionWorkItemStatus(record.status, status)) {
      const from = getWorkItemStatus(record.status).label;
      const to = getWorkItemStatus(status).label;
      return Promise.reject(
        new Error(`Work item cannot move directly from ${from} to ${to}.`),
      );
    }
    record.status = status;
    record.updatedAt = new Date().toISOString();
    return delay({ ...record });
  },
};
