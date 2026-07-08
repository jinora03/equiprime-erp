import type { InventoryItem } from "./types";

// warehouseId references features/warehouse/data.ts
export const inventorySeed: InventoryItem[] = [
  { id: 1, sku: "PRT-HYDPMP", name: "Hydraulic Pump", category: "Hydraulics", unit: "pc", warehouseId: 1, warehouseName: "Main Warehouse", onHand: 12, reserved: 2 },
  { id: 2, sku: "PRT-OILFLT", name: "Oil Filter", category: "Filters", unit: "pc", warehouseId: 1, warehouseName: "Main Warehouse", onHand: 140, reserved: 8 },
  { id: 3, sku: "PRT-ENGOIL", name: "Engine Oil", category: "Lubricants", unit: "L", warehouseId: 1, warehouseName: "Main Warehouse", onHand: 320, reserved: 20 },
  { id: 4, sku: "PRT-BEARNG", name: "Bearing", category: "Components", unit: "pc", warehouseId: 2, warehouseName: "Site Warehouse", onHand: 64, reserved: 0 },
  { id: 5, sku: "PRT-BOLTST", name: "Bolt Set", category: "Fasteners", unit: "set", warehouseId: 2, warehouseName: "Site Warehouse", onHand: 200, reserved: 12 },
  { id: 6, sku: "PRT-HYDFLT", name: "Hydraulic Filter", category: "Filters", unit: "pc", warehouseId: 1, warehouseName: "Main Warehouse", onHand: 5, reserved: 3 },
  { id: 7, sku: "PRT-SEALKT", name: "Hydraulic Seal Kit", category: "Hydraulics", unit: "kit", warehouseId: 1, warehouseName: "Main Warehouse", onHand: 18, reserved: 1 },
  { id: 8, sku: "PRT-AIRFLT", name: "Air Filter", category: "Filters", unit: "pc", warehouseId: 2, warehouseName: "Site Warehouse", onHand: 47, reserved: 4 },
];
