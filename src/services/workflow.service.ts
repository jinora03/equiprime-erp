import { delay } from "@/services/mock/delay";
import { WORKFLOWS } from "@/services/mock/workflow-data";
import type { Workflow, WorkflowStage } from "@/types";

/**
 * Workflow service (mock). Holds an in-memory, mutable copy of the seed
 * workflows so the admin editor's changes persist for the session. Swap the
 * `delay(...)` bodies for `apiClient` calls when the FastAPI endpoints exist —
 * consumers won't change.
 */

const cloneWorkflow = (w: Workflow): Workflow => ({
  ...w,
  stages: w.stages.map((s) => ({ ...s })),
});

let workflows: Workflow[] = WORKFLOWS.map(cloneWorkflow);

export interface WorkflowUpdateInput {
  name?: string;
  description?: string;
  status?: Workflow["status"];
  stages?: WorkflowStage[];
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

  async update(id: number, input: WorkflowUpdateInput): Promise<Workflow> {
    const workflow = workflows.find((w) => w.id === id);
    if (!workflow) throw new Error("Workflow not found");
    if (input.name !== undefined) workflow.name = input.name;
    if (input.description !== undefined) workflow.description = input.description;
    if (input.status !== undefined) workflow.status = input.status;
    if (input.stages !== undefined) {
      // Re-number stages to match their new order.
      workflow.stages = input.stages.map((s, i) => ({ ...s, order: i + 1 }));
    }
    workflow.updatedBy = "Christian Cua";
    workflow.updatedAt = new Date().toISOString();
    return delay(cloneWorkflow(workflow));
  },
};
