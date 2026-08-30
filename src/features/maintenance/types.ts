import type { Priority, WorkflowRecord } from "@/types";

export interface Maintenance extends WorkflowRecord {
  equipment: string;
  type: string;
  priority: Priority;
  scheduledDate: string;
}

/** Stable read DTO returned by the Maintenance service/API. */
export type MaintenanceResponse = Maintenance;

/** API write contract; actor/audit/workflow revision fields are server-owned. */
export interface CreateMaintenanceRequest {
  equipment: string;
  type: string;
  priority: Priority;
  scheduledDate: string;
  assignee?: string;
}
