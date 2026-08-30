import { delay } from "@/services/mock/delay";
import { requireMockPermission } from "@/services/mock/session-context";
import { WORKFLOWS } from "@/services/mock/workflow-data";
import type { Workflow, WorkflowResponse, WorkflowStage } from "@/types";

/**
 * Workflow service (mock). Workflow edits create immutable revisions so records
 * continue to resolve the exact business process version they started with.
 * A production backend should preserve the same contract with durable versions.
 */

const cloneWorkflow = (w: Workflow): Workflow => ({
  ...w,
  stages: w.stages.map((s) => ({ ...s })),
  transitions: w.transitions?.map((transition) => ({
    ...transition,
    conditions: transition.conditions?.map((condition) => ({ ...condition })),
    approverRoles: transition.approverRoles
      ? [...transition.approverRoles]
      : undefined,
  })),
});

let workflowVersions: Workflow[] = WORKFLOWS.map(cloneWorkflow);

/**
 * API write contract for workflow administration. The backend owns revision
 * numbering, updatedBy, updatedAt, and immutable historical versions.
 */
export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  status?: Workflow["status"];
  stages?: WorkflowStage[];
}

function latestById(id: number): Workflow | undefined {
  return workflowVersions
    .filter((workflow) => workflow.id === id)
    .sort((a, b) => b.version - a.version)[0];
}

function latestWorkflows(): Workflow[] {
  const ids = [...new Set(workflowVersions.map((workflow) => workflow.id))];
  return ids.flatMap((id) => {
    const workflow = latestById(id);
    return workflow ? [workflow] : [];
  });
}

function stageDeletionBlockReason(
  workflow: Workflow,
  stageId: string,
): string | null {
  const stage = workflow.stages.find((candidate) => candidate.id === stageId);
  if (!stage) return null;

  const referenced = (workflow.transitions ?? []).some(
    (transition) =>
      transition.fromStageId === stageId || transition.toStageId === stageId,
  );
  if (referenced) {
    return `${stage.name} is referenced by configured transitions and can't be deleted in this demo.`;
  }

  return null;
}

function validateStageUpdate(
  workflow: Workflow,
  stages: WorkflowStage[],
): void {
  if (stages.length === 0) throw new Error("A workflow must keep at least one stage.");

  const stageIds = new Set(stages.map((stage) => stage.id));
  if (stageIds.size !== stages.length) {
    throw new Error("Workflow stage IDs must be unique.");
  }

  for (const existing of workflow.stages) {
    if (!stageIds.has(existing.id)) {
      const reason = stageDeletionBlockReason(workflow, existing.id);
      if (reason) throw new Error(reason);
    }
  }

  for (const transition of workflow.transitions ?? []) {
    if (
      !stageIds.has(transition.fromStageId) ||
      !stageIds.has(transition.toStageId)
    ) {
      throw new Error("Workflow transitions must reference existing stages.");
    }
  }
}

export const workflowService = {
  async list(): Promise<WorkflowResponse[]> {
    return delay(latestWorkflows().map(cloneWorkflow));
  },

  async listVersionsByModule(moduleId: string): Promise<WorkflowResponse[]> {
    return delay(
      workflowVersions
        .filter((workflow) => workflow.moduleId === moduleId)
        .sort((a, b) => b.version - a.version)
        .map(cloneWorkflow),
    );
  },

  async get(id: number, version?: number): Promise<WorkflowResponse> {
    const workflow = version
      ? workflowVersions.find(
          (candidate) => candidate.id === id && candidate.version === version,
        )
      : latestById(id);
    if (!workflow) throw new Error("Workflow not found");
    return delay(cloneWorkflow(workflow));
  },

  /** Resolve the latest active workflow used for newly-created records. */
  async getByModule(moduleId: string): Promise<WorkflowResponse | null> {
    const workflow = latestWorkflows().find(
      (candidate) => candidate.moduleId === moduleId && candidate.status === "active",
    );
    return delay(workflow ? cloneWorkflow(workflow) : null);
  },

  /** Immediate UX guard; update() repeats this check authoritatively. */
  getStageDeletionBlockReason(id: number, stageId: string): string | null {
    const workflow = latestById(id);
    return workflow ? stageDeletionBlockReason(workflow, stageId) : null;
  },

  async update(id: number, input: UpdateWorkflowRequest): Promise<WorkflowResponse> {
    const actor = requireMockPermission("workflows:manage");
    const current = latestById(id);
    if (!current) throw new Error("Workflow not found");

    const nextStages = input.stages?.map((stage, index) => ({
      ...stage,
      order: index + 1,
    }));
    if (nextStages) validateStageUpdate(current, nextStages);

    // Backend-ready invariant: never mutate a workflow revision already referenced
    // by business records. Laravel should persist a new workflow version and keep
    // existing records pinned to their original version for historical accuracy.
    const next = cloneWorkflow(current);
    next.version = current.version + 1;
    if (input.name !== undefined) next.name = input.name;
    if (input.description !== undefined) next.description = input.description;
    if (input.status !== undefined) next.status = input.status;
    if (nextStages) next.stages = nextStages;
    next.updatedBy = actor.name;
    next.updatedAt = new Date().toISOString();
    workflowVersions.push(next);
    return delay(cloneWorkflow(next));
  },
};
