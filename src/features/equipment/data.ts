import type { Equipment } from "./types";

// customerId references features/customers/data.ts
export const equipmentSeed: Equipment[] = [
  { id: 1, code: "EX-101", name: "Excavator EX-101", model: "SE215W", type: "Excavator", customerId: 1, customerName: "ABC Construction" },
  { id: 2, code: "BD-220", name: "Bulldozer BD-220", model: "DH17", type: "Bulldozer", customerId: 2, customerName: "Prime Builders Corp." },
  { id: 3, code: "CR-550", name: "Crane CR-550", model: "STC500", type: "Crane", customerId: 3, customerName: "Delta Mining" },
  { id: 4, code: "SE215W", name: "Excavator SE215W", model: "SE215W-9", type: "Excavator", customerId: 1, customerName: "ABC Construction" },
  { id: 5, code: "WL-08", name: "Wheel Loader WL-08", model: "L956FH", type: "Wheel Loader", customerId: 2, customerName: "Prime Builders Corp." },
  { id: 6, code: "EX-12", name: "Excavator EX-12", model: "SE370", type: "Excavator", customerId: 4, customerName: "BuildWell Inc." },
  { id: 7, code: "BD-05", name: "Bulldozer BD-05", model: "SD16", type: "Bulldozer", customerId: 5, customerName: "XYZ Mining Corp." },
  { id: 8, code: "EX-09", name: "Excavator EX-09", model: "SE210", type: "Excavator", customerId: 6, customerName: "Metro Aggregates" },
  { id: 9, code: "CR-02", name: "Crane CR-02", model: "STC250", type: "Crane", customerId: 7, customerName: "Skyline Construction" },
];
