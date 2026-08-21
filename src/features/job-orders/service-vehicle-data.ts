import type { ServiceVehicle } from "./types";

/** Equiprime-owned field vehicles used to transport mechanics, tools, and parts. */
export const serviceVehicleSeed: ServiceVehicle[] = [
  { id: 1, code: "SV-01", name: "Service Truck 01", type: "Isuzu N-Series", plateNumber: "EQP-1001", companyId: "equiprime", branchId: "main", status: "active" },
  { id: 2, code: "SV-02", name: "Service Truck 02", type: "Mitsubishi Fuso Canter", plateNumber: "EQP-1002", companyId: "equiprime", branchId: "main", status: "active" },
  { id: 3, code: "SV-03", name: "Field Pickup 01", type: "Toyota Hilux", plateNumber: "EQP-1003", companyId: "equiprime", branchId: "main", status: "active" },
  { id: 4, code: "SV-04", name: "Parts Van 01", type: "Toyota HiAce", plateNumber: "EQP-1004", companyId: "equiprime", branchId: "main", status: "active" },
  { id: 5, code: "SV-C01", name: "Cebu Service Truck 01", type: "Isuzu N-Series", plateNumber: "EQP-2001", companyId: "equiprime", branchId: "cebu", status: "active" },
  { id: 6, code: "SV-C02", name: "Cebu Field Pickup 01", type: "Toyota Hilux", plateNumber: "EQP-2002", companyId: "equiprime", branchId: "cebu", status: "active" },
  { id: 7, code: "SV-D01", name: "Davao Service Truck 01", type: "Mitsubishi Fuso Canter", plateNumber: "EQP-3001", companyId: "equiprime", branchId: "davao", status: "active" },
  { id: 8, code: "SV-D02", name: "Davao Field Pickup 01", type: "Toyota Hilux", plateNumber: "EQP-3002", companyId: "equiprime", branchId: "davao", status: "active" },
];
