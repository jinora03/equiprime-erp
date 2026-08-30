import { delay } from "@/services/mock/delay";
import { matchesOrganizationScope } from "@/services/mock/scope";
import type { OrganizationScope } from "@/types";
import { inventorySeed } from "./data";
import { availableStock, type InventoryItem } from "./types";

/**
 * Mock inventory service. Warehouse owns inventory; job orders never mutate it
 * directly. Parts Requests reserve stock, and only a *Released* request deducts
 * on-hand stock (see features/parts). Swap for transactional backend commands
 * later; the validation rules here document the expected production behavior.
 */
const data: InventoryItem[] = inventorySeed.map((i) => ({ ...i }));

const find = (id: number) => data.find((i) => i.id === id);

export interface InventoryQuantityChange {
  id: number;
  qty: number;
}

function requirePositiveQuantity(qty: number): void {
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error("Inventory quantity must be greater than zero.");
  }
}

function requireItem(id: number, scope?: OrganizationScope): InventoryItem {
  const item = find(id);
  if (!item || !matchesOrganizationScope(item, scope)) {
    throw new Error("Inventory item not found in the active organization scope.");
  }
  return item;
}

function combineChanges(changes: InventoryQuantityChange[]): InventoryQuantityChange[] {
  const totals = new Map<number, number>();
  for (const change of changes) {
    requirePositiveQuantity(change.qty);
    totals.set(change.id, (totals.get(change.id) ?? 0) + change.qty);
  }
  return [...totals].map(([id, qty]) => ({ id, qty }));
}

export const inventoryService = {
  list(scope?: OrganizationScope): Promise<InventoryItem[]> {
    return delay(
      data
        .filter((item) => matchesOrganizationScope(item, scope))
        .map((item) => ({ ...item })),
    );
  },

  /** Reserve a batch only after every line passes validation (mock-atomic). */
  reserveMany(
    changes: InventoryQuantityChange[],
    scope?: OrganizationScope,
  ): Promise<void> {
    const combined = combineChanges(changes);
    const resolved = combined.map(({ id, qty }) => {
      const item = requireItem(id, scope);
      const available = availableStock(item);
      if (qty > available) {
        throw new Error(
          `Insufficient stock for ${item.name}. Requested ${qty} ${item.unit}; ${available} available.`,
        );
      }
      return { item, qty };
    });

    for (const { item, qty } of resolved) item.reserved += qty;
    return delay(undefined, 120);
  },

  /** Release reservations only when the full batch can be applied. */
  unreserveMany(
    changes: InventoryQuantityChange[],
    scope?: OrganizationScope,
  ): Promise<void> {
    const combined = combineChanges(changes);
    const resolved = combined.map(({ id, qty }) => {
      const item = requireItem(id, scope);
      if (qty > item.reserved) {
        throw new Error(
          `Cannot unreserve ${qty} ${item.unit} of ${item.name}; only ${item.reserved} reserved.`,
        );
      }
      return { item, qty };
    });

    for (const { item, qty } of resolved) item.reserved -= qty;
    return delay(undefined, 120);
  },

  /** Consume reserved stock only when every line is valid. */
  releaseMany(
    changes: InventoryQuantityChange[],
    scope?: OrganizationScope,
  ): Promise<void> {
    const combined = combineChanges(changes);
    const resolved = combined.map(({ id, qty }) => {
      const item = requireItem(id, scope);
      if (qty > item.reserved) {
        throw new Error(
          `Cannot release ${qty} ${item.unit} of ${item.name}; only ${item.reserved} reserved.`,
        );
      }
      if (qty > item.onHand) {
        throw new Error(
          `Cannot release ${qty} ${item.unit} of ${item.name}; only ${item.onHand} on hand.`,
        );
      }
      return { item, qty };
    });

    for (const { item, qty } of resolved) {
      item.onHand -= qty;
      item.reserved -= qty;
    }
    return delay(undefined, 120);
  },

  reserve(id: number, qty: number, scope?: OrganizationScope): Promise<void> {
    return this.reserveMany([{ id, qty }], scope);
  },

  unreserve(id: number, qty: number, scope?: OrganizationScope): Promise<void> {
    return this.unreserveMany([{ id, qty }], scope);
  },

  release(id: number, qty: number, scope?: OrganizationScope): Promise<void> {
    return this.releaseMany([{ id, qty }], scope);
  },
};
