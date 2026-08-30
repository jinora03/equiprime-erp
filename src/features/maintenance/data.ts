import { seedHistory } from "@/services/mock/workflow-seed";
import type { Maintenance } from "./types";

export const MAINTENANCE_STAGE_IDS = [
  "mt-scheduled",
  "mt-assigned",
  "mt-maintenance",
  "mt-inspection",
  "mt-completed",
];

const build = (
  data: Omit<Maintenance, "moduleId" | "workflowId" | "workflowVersion" | "title" | "history" | "updatedAt"> & {
    actor?: string;
  },
): Maintenance => {
  const { actor = "Carlos Aquino", ...rest } = data;
  return {
    ...rest,
    title: `${rest.type} — ${rest.equipment}`,
    moduleId: "maintenance",
    workflowId: 4,
    workflowVersion: 1,
    history: seedHistory(
      MAINTENANCE_STAGE_IDS,
      rest.currentStageId,
      actor,
      rest.createdAt,
    ),
    updatedAt: rest.createdAt,
  };
};

export const maintenanceSeed: Maintenance[] = [
  build({ id: 1, code: "MNT-2026-0001", companyId: "equiprime", branchId: "main", equipment: "Excavator EX-12", type: "500-hour service", priority: "High", scheduledDate: "2026-07-03", assignee: "Jun Bautista", currentStageId: "mt-maintenance", createdAt: "2026-06-26T08:00:00Z", actor: "Jun Bautista" }),
  build({ id: 2, code: "MNT-2026-0002", companyId: "equiprime", branchId: "main", equipment: "Wheel Loader WL-08", type: "250-hour service", priority: "Medium", scheduledDate: "2026-07-05", assignee: "Jun Bautista", currentStageId: "mt-assigned", createdAt: "2026-06-28T08:00:00Z", actor: "Jun Bautista" }),
  build({ id: 3, code: "MNT-2026-0003", companyId: "equiprime", branchId: "cebu", equipment: "Bulldozer BD-05", type: "Oil & filter change", priority: "Low", scheduledDate: "2026-07-08", assignee: "Rafael Mercado", currentStageId: "mt-scheduled", createdAt: "2026-06-29T08:00:00Z", actor: "Rafael Mercado" }),
  build({ id: 4, code: "MNT-2026-0004", companyId: "equiprime", branchId: "cebu", equipment: "Crane CR-02", type: "Annual certification", priority: "High", scheduledDate: "2026-07-10", assignee: "Rafael Mercado", currentStageId: "mt-inspection", createdAt: "2026-06-24T08:00:00Z", actor: "Rafael Mercado" }),
  build({ id: 5, code: "MNT-2026-0005", companyId: "equiprime", branchId: "main", equipment: "Excavator EX-09", type: "1000-hour service", priority: "Medium", scheduledDate: "2026-06-20", assignee: "Jun Bautista", currentStageId: "mt-completed", createdAt: "2026-06-14T08:00:00Z", actor: "Jun Bautista" }),
  build({ id: 6, code: "MNT-2026-0006", companyId: "equiprime", branchId: "davao", equipment: "Wheel Loader WL-03", type: "Brake inspection", priority: "Medium", scheduledDate: "2026-07-12", assignee: "Joel Manalo", currentStageId: "mt-scheduled", createdAt: "2026-06-30T08:00:00Z", actor: "Joel Manalo" }),
  build({ id: 7, code: "MNT-2026-0007", companyId: "equiprime", branchId: "main", equipment: "Motor Grader GR-14", type: "750-hour service", priority: "Medium", scheduledDate: "2026-08-25", assignee: "Adrian Valdez", currentStageId: "mt-assigned", createdAt: "2026-08-18T06:30:00Z", actor: "Adrian Valdez" }),
  build({ id: 8, code: "MNT-2026-0008", companyId: "equiprime", branchId: "main", equipment: "Forklift FL-07", type: "Mast and chain inspection", priority: "High", scheduledDate: "2026-08-24", assignee: "Luis Herrera", currentStageId: "mt-scheduled", createdAt: "2026-08-19T07:00:00Z", actor: "Luis Herrera" }),
  build({ id: 9, code: "MNT-2026-0009", companyId: "equiprime", branchId: "main", equipment: "Generator GEN-04", type: "Annual load-bank service", priority: "Low", scheduledDate: "2026-08-31", assignee: "Jerome Pascual", currentStageId: "mt-scheduled", createdAt: "2026-08-20T05:30:00Z", actor: "Jerome Pascual" }),
  build({ id: 10, code: "MNT-2026-0010", companyId: "equiprime", branchId: "main", equipment: "Excavator EX-18", type: "500-hour service", priority: "Medium", scheduledDate: "2026-09-03", assignee: "Adrian Valdez", currentStageId: "mt-scheduled", createdAt: "2026-08-21T04:20:00Z", actor: "Adrian Valdez" }),
  build({ id: 11, code: "MNT-2026-0011", companyId: "equiprime", branchId: "cebu", equipment: "Forklift FL-C02", type: "Quarterly safety inspection", priority: "Medium", scheduledDate: "2026-08-30", assignee: "Owen Ramos", currentStageId: "mt-assigned", createdAt: "2026-08-20T06:40:00Z", actor: "Owen Ramos" }),
  build({ id: 12, code: "MNT-2026-0012", companyId: "equiprime", branchId: "davao", equipment: "Generator GEN-D03", type: "Electrical preventive service", priority: "High", scheduledDate: "2026-08-27", assignee: "Mark Dizon", currentStageId: "mt-assigned", createdAt: "2026-08-19T06:15:00Z", actor: "Mark Dizon" }),
];
