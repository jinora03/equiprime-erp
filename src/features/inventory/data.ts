import type { InventoryItem } from "./types";

// warehouseId references features/warehouse/data.ts.
export const inventorySeed: InventoryItem[] = [
  { id: 1, sku: "PRT-HYDPMP", name: "Hydraulic Pump", category: "Hydraulics", unit: "pc", companyId: "equiprime", branchId: "main", warehouseId: 1, warehouseName: "Main Warehouse", onHand: 12, reserved: 2 },
  { id: 2, sku: "PRT-OILFLT", name: "Oil Filter", category: "Filters", unit: "pc", companyId: "equiprime", branchId: "main", warehouseId: 1, warehouseName: "Main Warehouse", onHand: 140, reserved: 8 },
  { id: 3, sku: "PRT-ENGOIL", name: "Engine Oil", category: "Lubricants", unit: "L", companyId: "equiprime", branchId: "main", warehouseId: 1, warehouseName: "Main Warehouse", onHand: 320, reserved: 20 },
  { id: 4, sku: "PRT-BEARNG", name: "Bearing", category: "Components", unit: "pc", companyId: "equiprime", branchId: "main", warehouseId: 2, warehouseName: "Site Warehouse", onHand: 64, reserved: 0 },
  { id: 5, sku: "PRT-BOLTST", name: "Bolt Set", category: "Fasteners", unit: "set", companyId: "equiprime", branchId: "main", warehouseId: 2, warehouseName: "Site Warehouse", onHand: 200, reserved: 12 },
  { id: 6, sku: "PRT-HYDFLT", name: "Hydraulic Filter", category: "Filters", unit: "pc", companyId: "equiprime", branchId: "main", warehouseId: 1, warehouseName: "Main Warehouse", onHand: 5, reserved: 3 },
  { id: 7, sku: "PRT-SEALKT", name: "Hydraulic Seal Kit", category: "Hydraulics", unit: "kit", companyId: "equiprime", branchId: "main", warehouseId: 1, warehouseName: "Main Warehouse", onHand: 18, reserved: 1 },
  { id: 8, sku: "PRT-AIRFLT", name: "Air Filter", category: "Filters", unit: "pc", companyId: "equiprime", branchId: "main", warehouseId: 2, warehouseName: "Site Warehouse", onHand: 47, reserved: 4 },
  { id: 9, sku: "CEB-OILFLT", name: "Oil Filter", category: "Filters", unit: "pc", companyId: "equiprime", branchId: "cebu", warehouseId: 3, warehouseName: "Cebu Warehouse", onHand: 76, reserved: 6 },
  { id: 10, sku: "CEB-HYDFLT", name: "Hydraulic Filter", category: "Filters", unit: "pc", companyId: "equiprime", branchId: "cebu", warehouseId: 3, warehouseName: "Cebu Warehouse", onHand: 22, reserved: 4 },
  { id: 11, sku: "CEB-ENGOIL", name: "Engine Oil", category: "Lubricants", unit: "L", companyId: "equiprime", branchId: "cebu", warehouseId: 3, warehouseName: "Cebu Warehouse", onHand: 180, reserved: 12 },
  { id: 12, sku: "CEB-SEALKT", name: "Hydraulic Seal Kit", category: "Hydraulics", unit: "kit", companyId: "equiprime", branchId: "cebu", warehouseId: 3, warehouseName: "Cebu Warehouse", onHand: 9, reserved: 2 },
  { id: 13, sku: "CEB-BOLTST", name: "Bolt Set", category: "Fasteners", unit: "set", companyId: "equiprime", branchId: "cebu", warehouseId: 3, warehouseName: "Cebu Warehouse", onHand: 95, reserved: 8 },
  { id: 14, sku: "DVO-OILFLT", name: "Oil Filter", category: "Filters", unit: "pc", companyId: "equiprime", branchId: "davao", warehouseId: 4, warehouseName: "Davao Warehouse", onHand: 58, reserved: 4 },
  { id: 15, sku: "DVO-HOSE", name: "Hydraulic Hose", category: "Hydraulics", unit: "pc", companyId: "equiprime", branchId: "davao", warehouseId: 4, warehouseName: "Davao Warehouse", onHand: 17, reserved: 3 },
  { id: 16, sku: "DVO-ENGOIL", name: "Engine Oil", category: "Lubricants", unit: "L", companyId: "equiprime", branchId: "davao", warehouseId: 4, warehouseName: "Davao Warehouse", onHand: 145, reserved: 10 },
  { id: 17, sku: "DVO-AIRFLT", name: "Air Filter", category: "Filters", unit: "pc", companyId: "equiprime", branchId: "davao", warehouseId: 4, warehouseName: "Davao Warehouse", onHand: 31, reserved: 1 },
  { id: 18, sku: "DVO-BEARNG", name: "Bearing", category: "Components", unit: "pc", companyId: "equiprime", branchId: "davao", warehouseId: 4, warehouseName: "Davao Warehouse", onHand: 42, reserved: 5 },
];
