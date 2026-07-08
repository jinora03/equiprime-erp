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
  data: Omit<Maintenance, "moduleId" | "title" | "history" | "updatedAt"> & {
    actor?: string;
  },
): Maintenance => {
  const { actor = "Carlos Aquino", ...rest } = data;
  return {
    ...rest,
    title: `${rest.type} — ${rest.equipment}`,
    moduleId: "maintenance",
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
  build({ id: 1, code: "MNT-2026-0001", equipment: "Excavator EX-12", type: "500-hour service", priority: "High", scheduledDate: "2026-07-03", assignee: "Jun Bautista", currentStageId: "mt-maintenance", createdAt: "2026-06-26T08:00:00Z" }),
  build({ id: 2, code: "MNT-2026-0002", equipment: "Wheel Loader WL-08", type: "250-hour service", priority: "Medium", scheduledDate: "2026-07-05", assignee: "Rafael Mercado", currentStageId: "mt-assigned", createdAt: "2026-06-28T08:00:00Z" }),
  build({ id: 3, code: "MNT-2026-0003", equipment: "Bulldozer BD-05", type: "Oil & filter change", priority: "Low", scheduledDate: "2026-07-08", assignee: null, currentStageId: "mt-scheduled", createdAt: "2026-06-29T08:00:00Z" }),
  build({ id: 4, code: "MNT-2026-0004", equipment: "Crane CR-02", type: "Annual certification", priority: "High", scheduledDate: "2026-07-10", assignee: "Carlos Aquino", currentStageId: "mt-inspection", createdAt: "2026-06-24T08:00:00Z" }),
  build({ id: 5, code: "MNT-2026-0005", equipment: "Excavator EX-09", type: "1000-hour service", priority: "Medium", scheduledDate: "2026-06-20", assignee: "Jun Bautista", currentStageId: "mt-completed", createdAt: "2026-06-14T08:00:00Z" }),
  build({ id: 6, code: "MNT-2026-0006", equipment: "Wheel Loader WL-03", type: "Brake inspection", priority: "Medium", scheduledDate: "2026-07-12", assignee: "Daniel Flores", currentStageId: "mt-scheduled", createdAt: "2026-06-30T08:00:00Z" }),
];
