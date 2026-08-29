import type { Priority } from "@/types";
import type { WorkItemStatus } from "./statuses";

/**
 * A Work Item is a child of a Job Order. It uses a fixed status (see
 * `statuses.ts`) rather than the Workflow Engine. Shape mirrors the future
 * ERP API `WorkItem` resource.
 */
export interface WorkItem {
  id: number;
  code: string;
  task: string;
  jobOrderId: number;
  jobOrderCode: string;
  companyId: string;
  branchId: string;
  assigneeId?: number | null;
  assignee?: string | null;
  priority: Priority;
  estimatedHours: number;
  actualHours: number;
  dueDate: string;
  status: WorkItemStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Stable read DTO returned by the Work Items service/API. */
export type WorkItemResponse = WorkItem;

export interface CreateWorkItemRequest {
  task: string;
  jobOrderId: number;
  assigneeId?: number;
  priority: Priority;
  estimatedHours?: number;
  dueDate?: string;
  notes?: string;
}
