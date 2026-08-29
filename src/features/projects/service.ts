import {
  createRecordStore,
  historyEntry,
  nextRecordId,
} from "@/services/workflow-records";
import {
  getInitialWorkflowStageId,
  type WorkflowMoveEvidence,
} from "@/services/workflow-rules";
import { workflowService } from "@/services/workflow.service";
import {
  requireMockPermission,
  requireMockSessionActor,
} from "@/services/mock/session-context";
import { getActiveOrganizationScope } from "@/store/organization.store";
import { projectSeed } from "./data";
import type { Project, ProjectInput } from "./types";

const store = createRecordStore<Project>("projects", projectSeed);
let counter = projectSeed.length;

export const projectService = {
  ...store,
  async moveStage(
    id: number,
    toStageId: string,
    input: { note?: string; evidence?: WorkflowMoveEvidence } = {},
  ): Promise<Project> {
    const actor = requireMockSessionActor();
    return store.moveStage(id, toStageId, {
      actor: actor.name,
      actorId: actor.id,
      actorRole: actor.role,
      permissions: actor.permissions,
      note: input.note,
      evidence: input.evidence,
    });
  },

  async create(input: ProjectInput): Promise<Project> {
    const now = new Date().toISOString();
    const actor = requireMockPermission("projects:create");
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
      history: [historyEntry(null, firstStage, actor.name, undefined, now)],
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
