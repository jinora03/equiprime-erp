import { seedHistory } from "@/services/mock/workflow-seed";
import type { JobOrder } from "./types";

export const JOB_ORDER_STAGE_IDS = [
  "jo-draft",
  "jo-submitted",
  "jo-approved",
  "jo-repair",
  "jo-waiting-parts",
  "jo-completed",
  "jo-closed",
];

/**
 * Seed timestamps are relative to "now" so the demo always shows realistic,
 * recent activity (a few days — never weeks/months) regardless of when it runs.
 * `createdAt` drives the seeded stage history (6h per transition), which in turn
 * drives the dashboard's elapsed-time / bottleneck calculations.
 */
const DAY_MS = 86_400_000;
const NOW = Date.now();
const daysAgo = (days: number): string =>
  new Date(NOW - days * DAY_MS).toISOString();
const dueInDays = (days: number): string =>
  new Date(NOW + days * DAY_MS).toISOString().slice(0, 10);

const build = (
  data: Omit<JobOrder, "moduleId" | "workflowId" | "workflowVersion" | "partsCycle" | "history" | "updatedAt"> & {
    actor?: string;
  },
): JobOrder => {
  const { actor = "Christian Cua", ...rest } = data;
  return {
    ...rest,
    moduleId: "job-orders",
    workflowId: 1,
    workflowVersion: 1,
    partsCycle: rest.currentStageId === "jo-waiting-parts" ? 1 : 0,
    history: seedHistory(
      JOB_ORDER_STAGE_IDS,
      rest.currentStageId,
      actor,
      rest.createdAt,
    ),
    updatedAt: rest.createdAt,
  };
};

export const jobOrderSeed: JobOrder[] = [
  build({ id: 1, code: "JO-2026-0105", title: "Repair Excavator – SE215W", companyId: "equiprime", branchId: "main", customer: "ABC Construction", customerId: 1, equipment: "Excavator SE215W", equipmentId: 4, serviceVehicleId: 1, serviceVehicle: "SV-01 · Service Truck 01", priority: "High", dueDate: dueInDays(1), assignee: "Jun Bautista, Miguel Torres", assigneeIds: [10, 25], description: "Full engine overhaul, pump replacement, and hydraulic test.", currentStageId: "jo-waiting-parts", createdAt: daysAgo(3), actor: "Jun Bautista" }),
  build({ id: 2, code: "JO-2026-0104", title: "Transmission Repair", companyId: "equiprime", branchId: "main", customer: "Prime Builders Corp.", customerId: 2, equipment: "Wheel Loader WL-08", equipmentId: 5, serviceVehicleId: 2, serviceVehicle: "SV-02 · Service Truck 02", priority: "Medium", dueDate: dueInDays(-2), assignee: "Jun Bautista", assigneeIds: [10], currentStageId: "jo-repair", createdAt: daysAgo(4), actor: "Jun Bautista" }),
  build({ id: 3, code: "JO-2026-0103", title: "Hydraulic Pump Replacement", companyId: "equiprime", branchId: "main", customer: "BuildWell Inc.", customerId: 4, equipment: "Excavator EX-12", equipmentId: 6, serviceVehicleId: 3, serviceVehicle: "SV-03 · Field Pickup 01", priority: "High", dueDate: dueInDays(-1), assignee: "Jun Bautista", assigneeIds: [10], currentStageId: "jo-completed", createdAt: daysAgo(4), actor: "Jun Bautista" }),
  build({ id: 4, code: "JO-2026-0102", title: "Undercarriage Inspection", companyId: "equiprime", branchId: "cebu", customer: "XYZ Mining Corp.", customerId: 5, equipment: "Bulldozer BD-05", equipmentId: 7, serviceVehicleId: 5, serviceVehicle: "SV-C01 · Cebu Service Truck 01", priority: "Low", dueDate: dueInDays(3), assignee: "Dennis Yap", assigneeIds: [21], currentStageId: "jo-draft", createdAt: daysAgo(2), actor: "Lea Garcia" }),
  build({ id: 5, code: "JO-2026-0101", title: "Bucket Reconditioning", companyId: "equiprime", branchId: "main", customer: "Metro Aggregates", customerId: 6, equipment: "Excavator EX-09", equipmentId: 8, serviceVehicleId: 4, serviceVehicle: "SV-04 · Parts Van 01", priority: "Medium", dueDate: dueInDays(2), assignee: "Jun Bautista", assigneeIds: [10], currentStageId: "jo-repair", createdAt: daysAgo(1), actor: "Jun Bautista" }),
  build({ id: 6, code: "JO-2026-0106", title: "Preventive Check – Crane", companyId: "equiprime", branchId: "cebu", customer: "Skyline Construction", customerId: 7, equipment: "Crane CR-02", equipmentId: 9, serviceVehicleId: 6, serviceVehicle: "SV-C02 · Cebu Field Pickup 01", priority: "Medium", dueDate: dueInDays(-1), assignee: "Rafael Mercado, Dennis Yap", assigneeIds: [19, 21], currentStageId: "jo-repair", createdAt: daysAgo(3), actor: "Lea Garcia" }),
  build({ id: 7, code: "JO-2026-0107", title: "Crane Hydraulic Inspection", companyId: "equiprime", branchId: "davao", customer: "Delta Mining", customerId: 3, equipment: "Crane CR-550", equipmentId: 3, serviceVehicleId: 7, serviceVehicle: "SV-D01 · Davao Service Truck 01", priority: "High", dueDate: dueInDays(-1), assignee: "Joel Manalo", assigneeIds: [23], currentStageId: "jo-repair", createdAt: daysAgo(3), actor: "Mina Lopez" }),
  build({ id: 8, code: "JO-2026-0108", title: "Cooling System Repair", companyId: "equiprime", branchId: "davao", customer: "Davao Earthworks", customerId: 8, equipment: "Excavator DV-11", equipmentId: 10, serviceVehicleId: 8, serviceVehicle: "SV-D02 · Davao Field Pickup 01", priority: "Medium", dueDate: dueInDays(3), assignee: "Joel Manalo, Niko Abad", assigneeIds: [23, 26], currentStageId: "jo-submitted", createdAt: daysAgo(1), actor: "Joel Manalo" }),
  build({ id: 9, code: "JO-2026-0109", title: "Grader Steering Calibration", companyId: "equiprime", branchId: "main", customer: "Northline Infrastructure", customerId: 9, equipment: "Motor Grader GR-14", equipmentId: 12, serviceVehicleId: 1, serviceVehicle: "SV-01 · Service Truck 01", priority: "Medium", dueDate: dueInDays(-1), assignee: "Adrian Valdez", assigneeIds: [27], currentStageId: "jo-repair", createdAt: daysAgo(3), actor: "Carlos Aquino" }),
  build({ id: 10, code: "JO-2026-0110", title: "Forklift Mast Repair", companyId: "equiprime", branchId: "main", customer: "HarborWorks Construction", customerId: 10, equipment: "Forklift FL-07", equipmentId: 13, serviceVehicleId: 2, serviceVehicle: "SV-02 · Service Truck 02", priority: "High", dueDate: dueInDays(1), assignee: "Luis Herrera", assigneeIds: [28], currentStageId: "jo-repair", createdAt: daysAgo(4), actor: "Carlos Aquino" }),
  build({ id: 11, code: "JO-2026-0111", title: "Generator Load Test", companyId: "equiprime", branchId: "main", customer: "SolidRock Aggregates", customerId: 11, equipment: "Generator GEN-04", equipmentId: 14, serviceVehicleId: 3, serviceVehicle: "SV-03 · Field Pickup 01", priority: "Low", dueDate: dueInDays(3), assignee: "Jerome Pascual", assigneeIds: [29], currentStageId: "jo-approved", createdAt: daysAgo(1), actor: "Carlos Aquino" }),
  build({ id: 12, code: "JO-2026-0112", title: "Compactor Hydraulic Leak", companyId: "equiprime", branchId: "main", customer: "Pacific Equipment Leasing", customerId: 12, equipment: "Compactor CP-03", equipmentId: 15, serviceVehicleId: 4, serviceVehicle: "SV-04 · Parts Van 01", priority: "High", dueDate: dueInDays(0), assignee: "Arvin Delgado", assigneeIds: [30], currentStageId: "jo-waiting-parts", createdAt: daysAgo(2), actor: "Arvin Delgado" }),
  build({ id: 13, code: "JO-2026-0113", title: "Excavator Undercarriage Check", companyId: "equiprime", branchId: "main", customer: "Northline Infrastructure", customerId: 9, equipment: "Excavator EX-18", equipmentId: 16, serviceVehicleId: 1, serviceVehicle: "SV-01 · Service Truck 01", priority: "Medium", dueDate: dueInDays(4), assignee: "Adrian Valdez, Luis Herrera", assigneeIds: [27, 28], currentStageId: "jo-submitted", createdAt: daysAgo(1), actor: "Adrian Valdez" }),
  build({ id: 14, code: "JO-2026-0114", title: "Excavator Preventive Inspection", companyId: "equiprime", branchId: "main", customer: "ABC Construction", customerId: 1, equipment: "Excavator EX-101", equipmentId: 1, serviceVehicleId: 3, serviceVehicle: "SV-03 · Field Pickup 01", priority: "Medium", dueDate: dueInDays(4), assignee: "Jerome Pascual, Arvin Delgado", assigneeIds: [29, 30], currentStageId: "jo-approved", createdAt: daysAgo(1), actor: "Carlos Aquino" }),
  build({ id: 15, code: "JO-2026-0115", title: "Forklift Safety Inspection", companyId: "equiprime", branchId: "cebu", customer: "Visayas Concrete Works", customerId: 13, equipment: "Forklift FL-C02", equipmentId: 17, serviceVehicleId: 5, serviceVehicle: "SV-C01 · Cebu Service Truck 01", priority: "Medium", dueDate: dueInDays(2), assignee: "Kent Salazar, Owen Ramos", assigneeIds: [31, 32], currentStageId: "jo-repair", createdAt: daysAgo(2), actor: "Lea Garcia" }),
  build({ id: 16, code: "JO-2026-0116", title: "Generator Electrical Repair", companyId: "equiprime", branchId: "davao", customer: "Mindanao Quarry Services", customerId: 14, equipment: "Generator GEN-D03", equipmentId: 20, serviceVehicleId: 7, serviceVehicle: "SV-D01 · Davao Service Truck 01", priority: "High", dueDate: dueInDays(1), assignee: "Francis Go, Mark Dizon", assigneeIds: [33, 34], currentStageId: "jo-repair", createdAt: daysAgo(2), actor: "Mina Lopez" }),
];
