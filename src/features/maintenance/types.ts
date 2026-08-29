import type { Priority, WorkflowRecord } from "@/types";

export interface Maintenance extends WorkflowRecord {
  equipment: string;
  type: string;
  priority: Priority;
  scheduledDate: string;
}

export interface MaintenanceInput {
  equipment: string;
  type: string;
  priority: Priority;
  scheduledDate: string;
  assignee?: string;
}
