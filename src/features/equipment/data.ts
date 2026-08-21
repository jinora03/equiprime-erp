import type { Equipment } from "./types";

// customerId references features/customers/data.ts.
export const equipmentSeed: Equipment[] = [
  { id: 1, code: "EX-101", name: "Excavator EX-101", model: "SE215W", type: "Excavator", companyId: "equiprime", branchId: "main", status: "in_use", customerId: 1, customerName: "ABC Construction" },
  { id: 2, code: "BD-220", name: "Bulldozer BD-220", model: "DH17", type: "Bulldozer", companyId: "equiprime", branchId: "main", status: "idle", customerId: 2, customerName: "Prime Builders Corp." },
  { id: 3, code: "CR-550", name: "Crane CR-550", model: "STC500", type: "Crane", companyId: "equiprime", branchId: "davao", status: "under_service", customerId: 3, customerName: "Delta Mining" },
  { id: 4, code: "SE215W", name: "Excavator SE215W", model: "SE215W-9", type: "Excavator", companyId: "equiprime", branchId: "main", status: "under_service", customerId: 1, customerName: "ABC Construction" },
  { id: 5, code: "WL-08", name: "Wheel Loader WL-08", model: "L956FH", type: "Wheel Loader", companyId: "equiprime", branchId: "main", status: "under_service", customerId: 2, customerName: "Prime Builders Corp." },
  { id: 6, code: "EX-12", name: "Excavator EX-12", model: "SE370", type: "Excavator", companyId: "equiprime", branchId: "main", status: "in_use", customerId: 4, customerName: "BuildWell Inc." },
  { id: 7, code: "BD-05", name: "Bulldozer BD-05", model: "SD16", type: "Bulldozer", companyId: "equiprime", branchId: "cebu", status: "under_service", customerId: 5, customerName: "XYZ Mining Corp." },
  { id: 8, code: "EX-09", name: "Excavator EX-09", model: "SE210", type: "Excavator", companyId: "equiprime", branchId: "main", status: "in_use", customerId: 6, customerName: "Metro Aggregates" },
  { id: 9, code: "CR-02", name: "Crane CR-02", model: "STC250", type: "Crane", companyId: "equiprime", branchId: "cebu", status: "idle", customerId: 7, customerName: "Skyline Construction" },
  { id: 10, code: "DV-11", name: "Excavator DV-11", model: "SE220", type: "Excavator", companyId: "equiprime", branchId: "davao", status: "in_use", customerId: 8, customerName: "Davao Earthworks" },
  { id: 11, code: "WL-03", name: "Wheel Loader WL-03", model: "L936", type: "Wheel Loader", companyId: "equiprime", branchId: "davao", status: "idle", customerId: 8, customerName: "Davao Earthworks" },
  { id: 12, code: "GR-14", name: "Motor Grader GR-14", model: "SG21-3", type: "Motor Grader", companyId: "equiprime", branchId: "main", status: "in_use", customerId: 9, customerName: "Northline Infrastructure" },
  { id: 13, code: "FL-07", name: "Forklift FL-07", model: "CPCD50", type: "Forklift", companyId: "equiprime", branchId: "main", status: "idle", customerId: 10, customerName: "HarborWorks Construction" },
  { id: 14, code: "GEN-04", name: "Generator GEN-04", model: "C150D5", type: "Generator", companyId: "equiprime", branchId: "main", status: "in_use", customerId: 11, customerName: "SolidRock Aggregates" },
  { id: 15, code: "CP-03", name: "Compactor CP-03", model: "SSR120", type: "Compactor", companyId: "equiprime", branchId: "main", status: "under_service", customerId: 12, customerName: "Pacific Equipment Leasing" },
  { id: 16, code: "EX-18", name: "Excavator EX-18", model: "SE260LC", type: "Excavator", companyId: "equiprime", branchId: "main", status: "idle", customerId: 9, customerName: "Northline Infrastructure" },
  { id: 17, code: "FL-C02", name: "Forklift FL-C02", model: "CPCD35", type: "Forklift", companyId: "equiprime", branchId: "cebu", status: "in_use", customerId: 13, customerName: "Visayas Concrete Works" },
  { id: 18, code: "GR-C01", name: "Motor Grader GR-C01", model: "SG18-3", type: "Motor Grader", companyId: "equiprime", branchId: "cebu", status: "under_service", customerId: 13, customerName: "Visayas Concrete Works" },
  { id: 19, code: "EX-D15", name: "Excavator EX-D15", model: "SE215W", type: "Excavator", companyId: "equiprime", branchId: "davao", status: "in_use", customerId: 14, customerName: "Mindanao Quarry Services" },
  { id: 20, code: "GEN-D03", name: "Generator GEN-D03", model: "C100D5", type: "Generator", companyId: "equiprime", branchId: "davao", status: "under_service", customerId: 14, customerName: "Mindanao Quarry Services" },
];
