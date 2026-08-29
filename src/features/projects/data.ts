import { seedHistory } from "@/services/mock/workflow-seed";
import type { Project } from "./types";

export const PROJECT_STAGE_IDS = [
  "pr-planning",
  "pr-execution",
  "pr-monitoring",
  "pr-completed",
];

const build = (
  data: Omit<Project, "moduleId" | "workflowId" | "workflowVersion" | "history" | "updatedAt"> & {
    actor?: string;
  },
): Project => {
  const { actor = "Angelica Torres", ...rest } = data;
  return {
    ...rest,
    moduleId: "projects",
    workflowId: 3,
    workflowVersion: 1,
    history: seedHistory(
      PROJECT_STAGE_IDS,
      rest.currentStageId,
      actor,
      rest.createdAt,
    ),
    updatedAt: rest.createdAt,
  };
};

export const projectSeed: Project[] = [
  build({ id: 1, code: "PRJ-2026-001", title: "Fleet Overhaul Program", companyId: "equiprime", branchId: "main", client: "ABC Construction", manager: "Grace Tan", progress: 55, startDate: "2026-05-02", dueDate: "2026-08-30", currentStageId: "pr-execution", createdAt: "2026-05-02T08:00:00Z", actor: "Grace Tan" }),
  build({ id: 2, code: "PRJ-2026-002", title: "Quarry Equipment Deployment", companyId: "equiprime", branchId: "cebu", client: "XYZ Mining Corp.", manager: "Lea Garcia", progress: 20, startDate: "2026-06-10", dueDate: "2026-09-15", currentStageId: "pr-planning", createdAt: "2026-06-10T08:00:00Z", actor: "Lea Garcia" }),
  build({ id: 3, code: "PRJ-2026-003", title: "Warehouse Crane Installation", companyId: "equiprime", branchId: "cebu", client: "Skyline Construction", manager: "Lea Garcia", progress: 80, startDate: "2026-04-01", dueDate: "2026-07-20", currentStageId: "pr-monitoring", createdAt: "2026-04-01T08:00:00Z", actor: "Lea Garcia" }),
  build({ id: 4, code: "PRJ-2026-004", title: "Preventive Maintenance Rollout", companyId: "equiprime", branchId: "main", client: "Prime Builders Corp.", manager: "Carlos Aquino", progress: 100, startDate: "2026-03-05", dueDate: "2026-06-15", currentStageId: "pr-completed", createdAt: "2026-03-05T08:00:00Z", actor: "Carlos Aquino" }),
  build({ id: 5, code: "PRJ-2026-005", title: "Telematics Integration", companyId: "equiprime", branchId: "main", client: "Metro Aggregates", manager: "Erika Villanueva", progress: 40, startDate: "2026-06-01", dueDate: "2026-10-01", currentStageId: "pr-execution", createdAt: "2026-06-01T08:00:00Z", actor: "Erika Villanueva" }),
  build({ id: 6, code: "PRJ-2026-006", title: "Davao Fleet Readiness", companyId: "equiprime", branchId: "davao", client: "Davao Earthworks", manager: "Mina Lopez", progress: 35, startDate: "2026-06-18", dueDate: "2026-09-30", currentStageId: "pr-execution", createdAt: "2026-06-18T08:00:00Z", actor: "Mina Lopez" }),
];
