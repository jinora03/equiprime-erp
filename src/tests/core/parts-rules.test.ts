import assert from "node:assert/strict";

import { arePartsReleasedForCycle } from "@/features/parts/rules";
import type { PartsRequest, PartsRequestStatus } from "@/features/parts/types";
import { coreTest } from "./test-harness";

function request(
  id: number,
  cycle: number,
  status: PartsRequestStatus,
): PartsRequest {
  return {
    id,
    code: `PR-${id}`,
    companyId: "equiprime",
    branchId: "main",
    jobOrderId: 1,
    jobOrderPartsCycle: cycle,
    status,
    items: [],
    requestedById: 1,
    requestedBy: "Test User",
    requestedByRole: "Mechanic",
    createdAt: "2026-08-30T00:00:00.000Z",
    updatedAt: "2026-08-30T00:00:00.000Z",
  };
}

export const tests = [
  coreTest("parts release is false before a waiting-for-parts cycle exists", () => {
    assert.equal(arePartsReleasedForCycle([], 0), false);
  }),

  coreTest("parts release requires at least one current-cycle request", () => {
    assert.equal(arePartsReleasedForCycle([request(1, 1, "released")], 2), false);
  }),

  coreTest("a released request from an older cycle cannot satisfy the current cycle", () => {
    const requests = [request(1, 1, "released"), request(2, 2, "pending")];
    assert.equal(arePartsReleasedForCycle(requests, 2), false);
  }),

  coreTest("every non-rejected current-cycle request must be released", () => {
    const requests = [request(1, 3, "released"), request(2, 3, "pending")];
    assert.equal(arePartsReleasedForCycle(requests, 3), false);
  }),

  coreTest("rejected requests do not block a released current-cycle requirement", () => {
    const requests = [request(1, 4, "released"), request(2, 4, "rejected")];
    assert.equal(arePartsReleasedForCycle(requests, 4), true);
  }),
];
