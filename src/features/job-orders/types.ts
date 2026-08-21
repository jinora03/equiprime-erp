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
  /** Workflow that drives this job order's stages. */
  workflowId?: number;
  priority: Priority;
  /** Active mechanics assigned to this job order. */
  assigneeIds: number[];
  /** Estimated completion date. */
  dueDate: string;
  description?: string;
  notes?: string;
}

export interface JobOrderInput {
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
  actor: string;
}
