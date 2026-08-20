import { partsRequestService } from "@/features/parts/service";
import { areAllWorkItemsComplete } from "@/features/work-items/statuses";
import { workItemService } from "@/features/work-items/service";
import {
  createRecordStore,
  historyEntry,
  nextRecordId,
} from "@/services/workflow-records";
import { getInitialWorkflowStageId } from "@/services/workflow-rules";
import { workflowService } from "@/services/workflow.service";
import { getActiveOrganizationScope } from "@/store/organization.store";
import { jobOrderSeed } from "./data";
import type { JobOrder, JobOrderInput } from "./types";

const store = createRecordStore<JobOrder>("job-orders", jobOrderSeed, {
  resolveWorkflow: (record) =>
    record.workflowId
      ? workflowService.get(record.workflowId)
      : workflowService.getByModule("job-orders"),
  getConditionContext: async (record) => {
    const [workItems, partsRequests] = await Promise.all([
      workItemService.list(record.id, {
        companyId: record.companyId,
        branchId: record.branchId,
      }),
      partsRequestService.listByJobOrder(record.id),
    ]);
    return {
      allWorkItemsCompleted: areAllWorkItemsComplete(workItems),
      partsReleased: partsRequests.some((request) => request.status === "released"),
      supervisorApproved: false,
      qaPassed: false,
    };
  },
});
let counter = Math.max(
  ...jobOrderSeed.map((job) => Number(job.code.split("-").at(-1) ?? 0)),
);

export const jobOrderService = {
  ...store,
  async create(input: JobOrderInput): Promise<JobOrder> {
    const now = new Date().toISOString();
    const scope = getActiveOrganizationScope();
    const workflow = await workflowService.get(input.workflowId);
    if (workflow.moduleId !== "job-orders" || workflow.status !== "active") {
      throw new Error("Select an active Job Orders workflow.");
    }
    const firstStage = getInitialWorkflowStageId(workflow);
    counter += 1;

    const record: JobOrder = {
      id: nextRecordId(),
      code: `JO-2026-${String(counter).padStart(4, "0")}`,
      title: input.title,
      moduleId: "job-orders",
      companyId: scope.companyId,
      branchId: scope.branchId,
      currentStageId: firstStage,
      history: [historyEntry(null, firstStage, input.actor, undefined, now)],
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
