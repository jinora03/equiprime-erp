import { seedHistory } from "@/services/mock/workflow-seed";
import type { JobOrder } from "./types";

export const JOB_ORDER_STAGE_IDS = [
  "jo-draft",
  "jo-submitted",
  "jo-approved",
  "jo-assigned",
  "jo-diagnosing",
  "jo-waiting-parts",
  "jo-repair",
  "jo-quality-check",
  "jo-completed",
  "jo-closed",
];

const build = (
  data: Omit<JobOrder, "moduleId" | "history" | "updatedAt"> & {
    actor?: string;
  },
): JobOrder => {
  const { actor = "Christian Cua", ...rest } = data;
  return {
    ...rest,
    moduleId: "job-orders",
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
  build({ id: 1, code: "JO-2026-0105", title: "Repair Excavator – SE215W", companyId: "equiprime", branchId: "main", customer: "ABC Construction", customerId: 1, equipment: "Excavator SE215W", equipmentId: 4, priority: "High", dueDate: "2026-07-05", assignee: "Jun Bautista, Miguel Torres", assigneeIds: [10, 25], description: "Full engine overhaul, pump replacement, and hydraulic test.", currentStageId: "jo-waiting-parts", createdAt: "2026-06-24T08:00:00Z", actor: "Jun Bautista" }),
  build({ id: 2, code: "JO-2026-0104", title: "Transmission Repair", companyId: "equiprime", branchId: "main", customer: "Prime Builders Corp.", customerId: 2, equipment: "Wheel Loader WL-08", equipmentId: 5, priority: "Medium", dueDate: "2026-07-08", assignee: "Jun Bautista", assigneeIds: [10], currentStageId: "jo-diagnosing", createdAt: "2026-06-25T09:30:00Z", actor: "Jun Bautista" }),
  build({ id: 3, code: "JO-2026-0103", title: "Hydraulic Pump Replacement", companyId: "equiprime", branchId: "main", customer: "BuildWell Inc.", customerId: 4, equipment: "Excavator EX-12", equipmentId: 6, priority: "High", dueDate: "2026-06-30", assignee: "Jun Bautista", assigneeIds: [10], currentStageId: "jo-completed", createdAt: "2026-06-20T07:15:00Z", actor: "Jun Bautista" }),
  build({ id: 4, code: "JO-2026-0102", title: "Undercarriage Inspection", companyId: "equiprime", branchId: "cebu", customer: "XYZ Mining Corp.", customerId: 5, equipment: "Bulldozer BD-05", equipmentId: 7, priority: "Low", dueDate: "2026-07-12", assignee: "Dennis Yap", assigneeIds: [21], currentStageId: "jo-draft", createdAt: "2026-06-28T10:00:00Z", actor: "Lea Garcia" }),
  build({ id: 5, code: "JO-2026-0101", title: "Bucket Reconditioning", companyId: "equiprime", branchId: "main", customer: "Metro Aggregates", customerId: 6, equipment: "Excavator EX-09", equipmentId: 8, priority: "Medium", dueDate: "2026-07-02", assignee: "Jun Bautista", assigneeIds: [10], currentStageId: "jo-quality-check", createdAt: "2026-06-22T08:45:00Z", actor: "Jun Bautista" }),
  build({ id: 6, code: "JO-2026-0106", title: "Preventive Check – Crane", companyId: "equiprime", branchId: "cebu", customer: "Skyline Construction", customerId: 7, equipment: "Crane CR-02", equipmentId: 9, priority: "Medium", dueDate: "2026-07-10", assignee: "Rafael Mercado, Dennis Yap", assigneeIds: [19, 21], currentStageId: "jo-approved", createdAt: "2026-06-29T11:20:00Z", actor: "Lea Garcia" }),
  build({ id: 7, code: "JO-2026-0107", title: "Crane Hydraulic Inspection", companyId: "equiprime", branchId: "davao", customer: "Delta Mining", customerId: 3, equipment: "Crane CR-550", equipmentId: 3, priority: "High", dueDate: "2026-07-11", assignee: "Joel Manalo", assigneeIds: [23], currentStageId: "jo-diagnosing", createdAt: "2026-06-30T07:40:00Z", actor: "Mina Lopez" }),
  build({ id: 8, code: "JO-2026-0108", title: "Cooling System Repair", companyId: "equiprime", branchId: "davao", customer: "Davao Earthworks", customerId: 8, equipment: "Excavator DV-11", equipmentId: 10, priority: "Medium", dueDate: "2026-07-14", assignee: "Joel Manalo, Niko Abad", assigneeIds: [23, 26], currentStageId: "jo-submitted", createdAt: "2026-07-01T06:50:00Z", actor: "Joel Manalo" }),
];
