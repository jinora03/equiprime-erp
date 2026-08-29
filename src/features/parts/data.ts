import type { PartsRequest } from "./types";

/**
 * Seed parts requests. Inventory effects of these seeds are already reflected in
 * the inventory seed's `reserved`/`onHand` — runtime approval decisions apply
 * deltas on top. Parts approvals are surfaced through My Approvals.
 *
 * Timestamps are relative to "now" so pending requests always show a realistic,
 * recent wait (hours/days, never weeks) on the service dashboard.
 */
const HOUR_MS = 3_600_000;
const NOW = Date.now();
const hoursAgo = (hours: number): string =>
  new Date(NOW - hours * HOUR_MS).toISOString();

export const partsRequestSeed: PartsRequest[] = [
  {
    id: 1,
    code: "PR-2026-0001",
    companyId: "equiprime",
    branchId: "main",
    jobOrderId: 1,
    jobOrderPartsCycle: 1,
    status: "released",
    items: [
      { inventoryItemId: 1, sku: "PRT-HYDPMP", name: "Hydraulic Pump", unit: "pc", quantity: 1 },
      { inventoryItemId: 7, sku: "PRT-SEALKT", name: "Hydraulic Seal Kit", unit: "kit", quantity: 1 },
    ],
    requestedById: 10,
    requestedBy: "Jun Bautista",
    requestedByRole: "Mechanic",
    createdAt: hoursAgo(70),
    updatedAt: hoursAgo(58),
    decision: {
      approvalRole: "Warehouse Staff",
      actorId: 5,
      actorName: "Ramon Cruz",
      actorRole: "Warehouse Staff",
      at: hoursAgo(58),
      note: "Stock confirmed and released.",
    },
  },
  {
    id: 2,
    code: "PR-2026-0002",
    companyId: "equiprime",
    branchId: "main",
    jobOrderId: 1,
    jobOrderPartsCycle: 1,
    status: "rejected",
    items: [
      { inventoryItemId: 2, sku: "PRT-OILFLT", name: "Oil Filter", unit: "pc", quantity: 4 },
    ],
    requestedById: 10,
    requestedBy: "Jun Bautista",
    requestedByRole: "Mechanic",
    createdAt: hoursAgo(66),
    updatedAt: hoursAgo(60),
    decision: {
      approvalRole: "Warehouse Staff",
      actorId: 6,
      actorName: "Andres Lim",
      actorRole: "Warehouse Staff",
      at: hoursAgo(60),
      note: "Use the existing allocated stock first.",
    },
  },
  {
    id: 3,
    code: "PR-2026-0003",
    companyId: "equiprime",
    branchId: "main",
    jobOrderId: 12,
    jobOrderPartsCycle: 1,
    status: "pending",
    items: [
      { inventoryItemId: 23, sku: "PRT-HYDHOSE", name: "Hydraulic Hose Assembly", unit: "pc", quantity: 3 },
    ],
    requestedById: 30,
    requestedBy: "Arvin Delgado",
    requestedByRole: "Mechanic",
    createdAt: hoursAgo(26),
    updatedAt: hoursAgo(26),
  },
];
