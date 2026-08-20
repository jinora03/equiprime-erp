import { delay } from "@/services/mock/delay";
import { matchesOrganizationScope } from "@/services/mock/scope";
import type { OrganizationScope } from "@/types";
import { inventorySeed } from "./data";
import type { InventoryItem } from "./types";

/**
 * Mock inventory service. Warehouse owns inventory; job orders never mutate it
 * directly. Parts Requests reserve stock, and only a *Released* request deducts
 * on-hand stock (see features/parts). Swap for `GET/PATCH /inventory` later.
 */
const data: InventoryItem[] = inventorySeed.map((i) => ({ ...i }));

const find = (id: number) => data.find((i) => i.id === id);

export const inventoryService = {
  list(scope?: OrganizationScope): Promise<InventoryItem[]> {
    return delay(
      data
        .filter((item) => matchesOrganizationScope(item, scope))
        .map((item) => ({ ...item })),
    );
  },

  /** Reserve stock when a parts request is raised. */
  reserve(id: number, qty: number): Promise<void> {
    const item = find(id);
    if (item) item.reserved += qty;
    return delay(undefined, 120);
  },

  /** Release a reservation without consuming stock (e.g. request rejected). */
  unreserve(id: number, qty: number): Promise<void> {
    const item = find(id);
    if (item) item.reserved = Math.max(0, item.reserved - qty);
    return delay(undefined, 120);
  },

  /** Consume stock when a parts request is Released. */
  release(id: number, qty: number): Promise<void> {
    const item = find(id);
    if (item) {
      item.onHand = Math.max(0, item.onHand - qty);
      item.reserved = Math.max(0, item.reserved - qty);
    }
    return delay(undefined, 120);
  },
};
