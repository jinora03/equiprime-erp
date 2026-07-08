import type { PartsRequest } from "./types";

/**
 * Seed parts requests. Inventory effects of these seeds are already reflected in
 * the inventory seed's `reserved`/`onHand` — runtime status changes apply deltas
 * on top. JO-2026-0105 (id 1) has a released request (so its "Parts released"
 * transition condition is satisfied) plus a rejected one kept in history.
 */
export const partsRequestSeed: PartsRequest[] = [
  {
    id: 1,
    code: "PR-2026-0001",
    jobOrderId: 1,
    status: "released",
    items: [
      { inventoryItemId: 1, sku: "PRT-HYDPMP", name: "Hydraulic Pump", unit: "pc", quantity: 1 },
      { inventoryItemId: 7, sku: "PRT-SEALKT", name: "Hydraulic Seal Kit", unit: "kit", quantity: 1 },
    ],
    requestedBy: "Jun Bautista",
    createdAt: "2026-06-25T09:30:00Z",
    updatedAt: "2026-06-26T10:00:00Z",
  },
  {
    id: 2,
    code: "PR-2026-0002",
    jobOrderId: 1,
    status: "rejected",
    items: [
      { inventoryItemId: 2, sku: "PRT-OILFLT", name: "Oil Filter", unit: "pc", quantity: 4 },
    ],
    requestedBy: "Jun Bautista",
    createdAt: "2026-06-26T08:00:00Z",
    updatedAt: "2026-06-26T14:00:00Z",
  },
];
