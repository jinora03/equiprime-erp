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

export interface PartsRequest {
  id: number;
  code: string;
  jobOrderId: number;
  status: PartsRequestStatus;
  items: PartsRequestItem[];
  requestedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartsRequestInput {
  jobOrderId: number;
  items: PartsRequestItem[];
  requestedBy: string;
}
