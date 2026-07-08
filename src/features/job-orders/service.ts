import {
  createRecordStore,
  historyEntry,
  nextRecordId,
} from "@/services/workflow-records";
import { WORKFLOWS } from "@/services/mock/workflow-data";
import { jobOrderSeed } from "./data";
import type { JobOrder, JobOrderInput } from "./types";

const store = createRecordStore<JobOrder>(jobOrderSeed);
let counter = jobOrderSeed.length + 106;

export const jobOrderService = {
  ...store,
  create(input: JobOrderInput): Promise<JobOrder> {
    const now = new Date().toISOString();
    counter += 1;

    // New job orders enter at the first stage of their assigned workflow.
    const workflow = WORKFLOWS.find((w) => w.id === input.workflowId);
    const firstStage =
      [...(workflow?.stages ?? [])].sort((a, b) => a.order - b.order)[0]?.id ??
      "jo-draft";

    const record: JobOrder = {
      id: nextRecordId(),
      code: `JO-2026-${String(counter).padStart(4, "0")}`,
      title: input.title,
      moduleId: "job-orders",
      currentStageId: firstStage,
      history: [historyEntry(null, firstStage, "Christian Cua", undefined, now)],
      assignee: input.assignee || null,
      customer: input.customerName,
      customerId: input.customerId,
      equipment: input.equipmentName,
      equipmentId: input.equipmentId,
      workflowId: input.workflowId,
      priority: input.priority,
      dueDate: input.dueDate,
      description: input.description,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    return store.add(record);
  },
};
