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
  build({
    id: 1,
    code: "JO-2026-0105",
    title: "Repair Excavator – SE215W",
    customer: "ABC Construction",
    equipment: "Excavator SE215W",
    priority: "High",
    dueDate: "2026-07-05",
    assignee: "Jun Bautista",
    description: "Full engine overhaul, pump replacement, and hydraulic test.",
    currentStageId: "jo-waiting-parts",
    createdAt: "2026-06-24T08:00:00Z",
    actor: "Jun Bautista",
  }),
  build({
    id: 2,
    code: "JO-2026-0104",
    title: "Transmission Repair",
    customer: "Prime Builders Corp.",
    equipment: "Wheel Loader WL-08",
    priority: "Medium",
    dueDate: "2026-07-08",
    assignee: "Rafael Mercado",
    currentStageId: "jo-diagnosing",
    createdAt: "2026-06-25T09:30:00Z",
  }),
  build({
    id: 3,
    code: "JO-2026-0103",
    title: "Hydraulic Pump Replacement",
    customer: "BuildWell Inc.",
    equipment: "Excavator EX-12",
    priority: "High",
    dueDate: "2026-06-30",
    assignee: "Jun Bautista",
    currentStageId: "jo-completed",
    createdAt: "2026-06-20T07:15:00Z",
  }),
  build({
    id: 4,
    code: "JO-2026-0102",
    title: "Undercarriage Inspection",
    customer: "XYZ Mining Corp.",
    equipment: "Bulldozer BD-05",
    priority: "Low",
    dueDate: "2026-07-12",
    assignee: null,
    currentStageId: "jo-draft",
    createdAt: "2026-06-28T10:00:00Z",
  }),
  build({
    id: 5,
    code: "JO-2026-0101",
    title: "Bucket Reconditioning",
    customer: "Metro Aggregates",
    equipment: "Excavator EX-09",
    priority: "Medium",
    dueDate: "2026-07-02",
    assignee: "Rafael Mercado",
    currentStageId: "jo-quality-check",
    createdAt: "2026-06-22T08:45:00Z",
  }),
  build({
    id: 6,
    code: "JO-2026-0106",
    title: "Preventive Check – Crane",
    customer: "Skyline Construction",
    equipment: "Crane CR-02",
    priority: "Medium",
    dueDate: "2026-07-10",
    assignee: "Carlos Aquino",
    currentStageId: "jo-approved",
    createdAt: "2026-06-29T11:20:00Z",
  }),
];
