import { delay } from "@/services/mock/delay";
import { WORKFLOWS } from "@/services/mock/workflow-data";
import { countWorkflowRecordsInStage } from "@/services/workflow-record-registry";
import type { Workflow, WorkflowStage } from "@/types";

/**
 * Workflow service (mock). Holds an in-memory, mutable copy of the seed
 * workflows so the admin editor's changes persist for the session. Swap the
 * `delay(...)` bodies for API calls when a backend exists; consumers stay the
 * same.
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

let workflows: Workflow[] = WORKFLOWS.map(cloneWorkflow);

export interface WorkflowUpdateInput {
  name?: string;
  description?: string;
  status?: Workflow["status"];
  stages?: WorkflowStage[];
  actor: string;
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

  const recordCount = countWorkflowRecordsInStage(workflow.moduleId, stageId);
  if (recordCount > 0) {
    return `${recordCount} demo record${recordCount === 1 ? " currently uses" : "s currently use"} ${stage.name}. Move those records first.`;
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
  async list(): Promise<Workflow[]> {
    return delay(workflows.map(cloneWorkflow));
  },

  async get(id: number): Promise<Workflow> {
    const workflow = workflows.find((w) => w.id === id);
    if (!workflow) throw new Error("Workflow not found");
    return delay(cloneWorkflow(workflow));
  },

  /** Resolve the active workflow that drives a given module. */
  async getByModule(moduleId: string): Promise<Workflow | null> {
    const workflow = workflows.find(
      (w) => w.moduleId === moduleId && w.status === "active",
    );
    return delay(workflow ? cloneWorkflow(workflow) : null);
  },

  /** Immediate UX guard; update() repeats this check authoritatively. */
  getStageDeletionBlockReason(id: number, stageId: string): string | null {
    const workflow = workflows.find((candidate) => candidate.id === id);
    return workflow ? stageDeletionBlockReason(workflow, stageId) : null;
  },

  async update(id: number, input: WorkflowUpdateInput): Promise<Workflow> {
    const workflow = workflows.find((w) => w.id === id);
    if (!workflow) throw new Error("Workflow not found");

    const nextStages = input.stages?.map((stage, index) => ({
      ...stage,
      order: index + 1,
    }));
    if (nextStages) validateStageUpdate(workflow, nextStages);

    // Apply only after all validation succeeds so a failed stage edit cannot
    // partially mutate the in-memory workflow.
    if (input.name !== undefined) workflow.name = input.name;
    if (input.description !== undefined) workflow.description = input.description;
    if (input.status !== undefined) workflow.status = input.status;
    if (nextStages) workflow.stages = nextStages;
    workflow.updatedBy = input.actor;
    workflow.updatedAt = new Date().toISOString();
    return delay(cloneWorkflow(workflow));
  },
};
