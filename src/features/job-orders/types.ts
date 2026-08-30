import type { Priority, WorkflowRecord } from "@/types";

export type ServiceVehicleStatus = "active" | "maintenance" | "inactive";

export interface ServiceVehicle {
  id: number;
  code: string;
  name: string;
  type: string;
  plateNumber: string;
  companyId: string;
  branchId: string;
  status: ServiceVehicleStatus;
}

export interface JobOrder extends WorkflowRecord {
  /** Display name (kept for tables); id is the API-ready reference. */
  customer: string;
  customerId: number;
  equipment: string;
  equipmentId: number;
  /** Optional Equiprime service vehicle used by the field crew for this job. */
  serviceVehicleId?: number | null;
  serviceVehicle?: string | null;
  priority: Priority;
  /** Number of times this job has entered Waiting for Parts. */
  partsCycle: number;
  /** Active mechanics assigned to this job order. */
  assigneeIds: number[];
  /** Estimated completion date. */
  dueDate: string;
  description?: string;
  notes?: string;
}

/**
 * API write contract for creating a Job Order.
 *
 * Intentionally excludes server-owned fields such as id/code, actor identity,
 * workflowVersion, partsCycle, timestamps, and audit history. Laravel should
 * derive/generate those values after authenticating and authorizing the request.
 */
export interface CreateJobOrderRequest {
  title: string;
  description?: string;
  customerId: number;
  equipmentId: number;
  serviceVehicleId?: number | null;
  assigneeIds: number[];
  priority: Priority;
  workflowId: number;
  dueDate: string;
  notes?: string;
}

/** Stable read DTO returned by the Job Orders service/API. */
export type JobOrderResponse = JobOrder;

export interface JobOrderLabor {
  id: number;
  mechanic: string;
  date: string;
  hours: number;
  rate: number;
}

export interface JobOrderAttachment {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}
