import assert from "node:assert/strict";

import { inventoryService } from "@/features/inventory/service";
import type { OrganizationScope } from "@/types";
import { coreTest } from "./test-harness";

const mainScope: OrganizationScope = { companyId: "equiprime", branchId: "main" };

async function getItem(id: number) {
  const item = (await inventoryService.list(mainScope)).find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Inventory test item ${id} not found.`);
  return item;
}

export const tests = [
  coreTest("inventory rejects zero and negative reservation quantities", async () => {
    await assert.rejects(async () => inventoryService.reserve(1, 0, mainScope), /greater than zero/i);
    await assert.rejects(async () => inventoryService.reserve(1, -1, mainScope), /greater than zero/i);
  }),

  coreTest("inventory rejects reservations above available stock", async () => {
    const before = await getItem(6); // 5 on hand, 3 reserved => 2 available
    await assert.rejects(
      async () => inventoryService.reserve(6, 3, mainScope),
      /insufficient stock/i,
    );
    assert.deepEqual(await getItem(6), before);
  }),

  coreTest("inventory rejects items outside the active organization scope", async () => {
    await assert.rejects(
      async () => inventoryService.reserve(9, 1, mainScope),
      /active organization scope/i,
    );
  }),

  coreTest("failed multi-item reservations are mock-atomic", async () => {
    const before = await getItem(1);
    await assert.rejects(
      async () =>
        inventoryService.reserveMany(
          [
            { id: 1, qty: 1 },
            { id: 6, qty: 99 },
          ],
          mainScope,
        ),
      /insufficient stock/i,
    );
    assert.deepEqual(await getItem(1), before);
  }),

  coreTest("valid reservation and unreservation restore the original balance", async () => {
    const before = await getItem(4);
    try {
      await inventoryService.reserve(4, 2, mainScope);
      const reserved = await getItem(4);
      assert.equal(reserved.reserved, before.reserved + 2);
      assert.equal(reserved.onHand, before.onHand);
    } finally {
      const current = await getItem(4);
      const delta = current.reserved - before.reserved;
      if (delta > 0) await inventoryService.unreserve(4, delta, mainScope);
    }
    assert.deepEqual(await getItem(4), before);
  }),

  coreTest("duplicate inventory lines are combined before availability validation", async () => {
    const before = await getItem(6); // only 2 available
    await assert.rejects(
      async () =>
        inventoryService.reserveMany(
          [
            { id: 6, qty: 1 },
            { id: 6, qty: 2 },
          ],
          mainScope,
        ),
      /insufficient stock/i,
    );
    assert.deepEqual(await getItem(6), before);
  }),
];
