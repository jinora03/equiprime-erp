import type { Priority, WorkflowRecord } from "@/types";

export interface JobOrder extends WorkflowRecord {
  /** Display name (kept for tables); id is the API-ready reference. */
  customer: string;
  customerId?: number;
  equipment: string;
  equipmentId?: number;
  /** Workflow that drives this job order's stages. */
  workflowId?: number;
  priority: Priority;
  /** Estimated completion date. */
  dueDate: string;
  description?: string;
  notes?: string;
}

export interface JobOrderInput {
  title: string;
  description?: string;
  customerId: number;
  customerName: string;
  equipmentId: number;
  equipmentName: string;
  assignee?: string;
  priority: Priority;
  workflowId: number;
  dueDate: string;
  notes?: string;
  actor: string;
}
