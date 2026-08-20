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
