import type { Warehouse } from "./types";

export const warehouseSeed: Warehouse[] = [
  { id: 1, code: "WH-MAIN", name: "Main Warehouse", companyId: "equiprime", branchId: "main", location: "Manila HQ" },
  { id: 2, code: "WH-SITE", name: "Site Warehouse", companyId: "equiprime", branchId: "main", location: "Cavite Yard" },
  { id: 3, code: "WH-CEBU", name: "Cebu Warehouse", companyId: "equiprime", branchId: "cebu", location: "Cebu Service Center" },
  { id: 4, code: "WH-DVO", name: "Davao Warehouse", companyId: "equiprime", branchId: "davao", location: "Davao Service Center" },
];
