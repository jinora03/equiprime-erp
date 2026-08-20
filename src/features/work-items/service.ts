import { delay, nextId } from "@/services/mock/delay";
import { matchesOrganizationScope } from "@/services/mock/scope";
import { getActiveOrganizationScope } from "@/store/organization.store";
import type { OrganizationScope } from "@/types";
import { workItemSeed } from "./data";
import type { WorkItemStatus } from "./statuses";
import type { WorkItem, WorkItemInput } from "./types";

/**
 * WorkItemService — mock repository for a job order's work items. Bespoke (not
 * the workflow record store) because work items use fixed statuses. Swap the
 * `delay()` bodies for FastAPI calls later; the hooks + UI stay the same.
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

  create(input: WorkItemInput): Promise<WorkItem> {
    const now = new Date().toISOString();
    const scope = getActiveOrganizationScope();
    counter += 1;
    const record: WorkItem = {
      id: nextId(),
      code: `WI-2026-${String(counter).padStart(4, "0")}`,
      task: input.task,
      jobOrderId: input.jobOrderId,
      jobOrderCode: input.jobOrderCode,
      companyId: scope.companyId,
      branchId: scope.branchId,
      assignee: input.assignee || null,
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

  updateStatus(id: number, status: WorkItemStatus): Promise<WorkItem> {
    const record = data.find(
      (workItem) =>
        workItem.id === id && matchesOrganizationScope(workItem),
    );
    if (!record) return Promise.reject(new Error("Work item not found"));
    record.status = status;
    record.updatedAt = new Date().toISOString();
    return delay({ ...record });
  },
};
