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
  /** Waiting-for-parts episode this request belongs to. */
  jobOrderPartsCycle: number;
  status: PartsRequestStatus;
  items: PartsRequestItem[];
  requestedById: number;
  requestedBy: string;
  requestedByRole: string;
  createdAt: string;
  updatedAt: string;
  decision?: PartsRequestDecision;
}

/**
 * Backend-ready write DTO. The browser sends only authoritative references and
 * quantities; SKU/name/unit are read-model fields and must be resolved from the
 * inventory record by Laravel rather than accepted from client input.
 */
export interface CreatePartsRequestItemRequest {
  inventoryItemId: number;
  quantity: number;
}

/**
 * Requester identity is deliberately absent. The authenticated backend session
 * owns requestedBy/requestedByRole and the server must verify Job Order access.
 */
export interface CreatePartsRequestRequest {
  jobOrderId: number;
  items: CreatePartsRequestItemRequest[];
}

/** Stable read DTO returned by the Parts Requests service/API. */
export type PartsRequestResponse = PartsRequest;
