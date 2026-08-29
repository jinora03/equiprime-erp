import {
  createRecordStore,
  historyEntry,
  nextRecordId,
} from "@/services/workflow-records";
import { getInitialWorkflowStageId } from "@/services/workflow-rules";
import { workflowService } from "@/services/workflow.service";
import { getActiveOrganizationScope } from "@/store/organization.store";
import { projectSeed } from "./data";
import type { Project, ProjectInput } from "./types";

const store = createRecordStore<Project>("projects", projectSeed);
let counter = projectSeed.length;

export const projectService = {
  ...store,
  async create(input: ProjectInput): Promise<Project> {
    const now = new Date().toISOString();
    const scope = getActiveOrganizationScope();
    const workflow = await workflowService.getByModule("projects");
    if (!workflow) throw new Error("No active Project workflow is configured.");
    const firstStage = getInitialWorkflowStageId(workflow);
    counter += 1;

    const record: Project = {
      id: nextRecordId(),
      code: `PRJ-2026-${String(counter).padStart(3, "0")}`,
      title: input.title,
      moduleId: "projects",
      workflowId: workflow.id,
      workflowVersion: workflow.version,
      companyId: scope.companyId,
      branchId: scope.branchId,
      currentStageId: firstStage,
      history: [historyEntry(null, firstStage, input.actor, undefined, now)],
      assignee: input.manager,
      client: input.client,
      manager: input.manager,
      progress: 0,
      startDate: input.startDate,
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now,
    };
    return store.add(record);
  },
};
