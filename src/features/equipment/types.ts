export type EquipmentStatus = "in_use" | "under_service" | "idle" | "decommissioned";

export interface Equipment {
  id: number;
  code: string;
  name: string;
  model: string;
  type: string;
  companyId: string;
  branchId: string;
  status: EquipmentStatus;
  /** Owning customer — used to auto-fill the customer on a job order. */
  customerId: number;
  customerName: string;
}
