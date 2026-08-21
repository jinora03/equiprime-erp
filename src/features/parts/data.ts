import type { PartsRequest } from "./types";

/**
 * Seed parts requests. Inventory effects of these seeds are already reflected in
 * the inventory seed's `reserved`/`onHand` — runtime approval decisions apply
 * deltas on top. Parts approvals are surfaced through My Approvals.
 */
export const partsRequestSeed: PartsRequest[] = [
  {
    id: 1,
    code: "PR-2026-0001",
    companyId: "equiprime",
    branchId: "main",
    jobOrderId: 1,
    status: "released",
    items: [
      { inventoryItemId: 1, sku: "PRT-HYDPMP", name: "Hydraulic Pump", unit: "pc", quantity: 1 },
      { inventoryItemId: 7, sku: "PRT-SEALKT", name: "Hydraulic Seal Kit", unit: "kit", quantity: 1 },
    ],
    requestedById: 10,
    requestedBy: "Jun Bautista",
    requestedByRole: "Mechanic",
    createdAt: "2026-06-25T09:30:00Z",
    updatedAt: "2026-06-26T10:00:00Z",
    decision: {
      approvalRole: "Warehouse Staff",
      actorId: 5,
      actorName: "Ramon Cruz",
      actorRole: "Warehouse Staff",
      at: "2026-06-26T10:00:00Z",
      note: "Stock confirmed and released.",
    },
  },
  {
    id: 2,
    code: "PR-2026-0002",
    companyId: "equiprime",
    branchId: "main",
    jobOrderId: 1,
    status: "rejected",
    items: [
      { inventoryItemId: 2, sku: "PRT-OILFLT", name: "Oil Filter", unit: "pc", quantity: 4 },
    ],
    requestedById: 10,
    requestedBy: "Jun Bautista",
    requestedByRole: "Mechanic",
    createdAt: "2026-06-26T08:00:00Z",
    updatedAt: "2026-06-26T14:00:00Z",
    decision: {
      approvalRole: "Warehouse Staff",
      actorId: 6,
      actorName: "Andres Lim",
      actorRole: "Warehouse Staff",
      at: "2026-06-26T14:00:00Z",
      note: "Use the existing allocated stock first.",
    },
  },
];
