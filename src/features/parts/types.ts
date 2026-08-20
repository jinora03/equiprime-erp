export type PartsRequestStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "released";

export interface PartsRequestItem {
  inventoryItemId: number;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
}

export interface PartsRequestDecision {
  approvalRole: string;
  actorId: number;
  actorName: string;
  actorRole: string;
  at: string;
  note?: string;
}

export interface PartsRequest {
  id: number;
  code: string;
  companyId: string;
  branchId: string;
  jobOrderId: number;
  status: PartsRequestStatus;
  items: PartsRequestItem[];
  requestedById: number;
  requestedBy: string;
  requestedByRole: string;
  createdAt: string;
  updatedAt: string;
  decision?: PartsRequestDecision;
}

export interface PartsRequestInput {
  jobOrderId: number;
  items: PartsRequestItem[];
  requestedBy: {
    id: number;
    name: string;
    role: string;
  };
}
