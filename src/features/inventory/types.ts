export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  unit: string;
  companyId: string;
  branchId: string;
  warehouseId: number;
  warehouseName: string;
  onHand: number;
  reserved: number;
}

/** Available = on hand minus reserved. */
export const availableStock = (item: Pick<InventoryItem, "onHand" | "reserved">) =>
  item.onHand - item.reserved;

/**
 * Existing demo low-stock rule, now shared so Inventory and Dashboard agree.
 * This is an availability threshold, not a per-item reorder-point model.
 */
export const LOW_STOCK_AVAILABLE_THRESHOLD = 5;

export const isLowStock = (
  item: Pick<InventoryItem, "onHand" | "reserved">,
) => availableStock(item) <= LOW_STOCK_AVAILABLE_THRESHOLD;
