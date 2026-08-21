import { customerService } from "@/features/customers/service";
import { equipmentService } from "@/features/equipment/service";
import { partsRequestService } from "@/features/parts/service";
import { areAllWorkItemsComplete } from "@/features/work-items/statuses";
import { workItemService } from "@/features/work-items/service";
import {
  createRecordStore,
  historyEntry,
  nextRecordId,
} from "@/services/workflow-records";
import { getInitialWorkflowStageId } from "@/services/workflow-rules";
import { userService } from "@/services/user.service";
import { workflowService } from "@/services/workflow.service";
import { getActiveOrganizationScope } from "@/store/organization.store";
import { jobOrderSeed } from "./data";
import { serviceVehicleService } from "./service-vehicle-service";
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
    const [workflow, customer, equipment, mechanics, serviceVehicle] =
      await Promise.all([
        workflowService.get(input.workflowId),
        customerService.get(input.customerId, scope),
        equipmentService.get(input.equipmentId, scope),
        userService.listMechanics(scope),
        input.serviceVehicleId
          ? serviceVehicleService.get(input.serviceVehicleId, scope)
          : Promise.resolve(null),
      ]);
    if (workflow.moduleId !== "job-orders" || workflow.status !== "active") {
      throw new Error("Select an active Job Orders workflow.");
    }
    if (!customer) throw new Error("Select a customer from the active branch.");
    if (!equipment || equipment.customerId !== customer.id) {
      throw new Error("Select equipment that belongs to the selected customer.");
    }
    if (input.serviceVehicleId && !serviceVehicle) {
      throw new Error("Select an active service vehicle from this branch.");
    }

    const mechanicById = new Map(
      mechanics.map((mechanic) => [mechanic.id, mechanic]),
    );
    const selectedMechanics = input.assigneeIds.flatMap((id) => {
      const mechanic = mechanicById.get(id);
      return mechanic ? [mechanic] : [];
    });
    if (selectedMechanics.length !== input.assigneeIds.length) {
      throw new Error(
        "One or more selected mechanics are not available in this branch.",
      );
    }
    const assigneeNames = selectedMechanics.map(
      (mechanic) => mechanic.full_name,
    );

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
      assignee: assigneeNames.length > 0 ? assigneeNames.join(", ") : null,
      assigneeIds: [...input.assigneeIds],
      customer: customer.name,
      customerId: customer.id,
      equipment: equipment.name,
      equipmentId: equipment.id,
      serviceVehicleId: serviceVehicle?.id ?? null,
      serviceVehicle: serviceVehicle
        ? `${serviceVehicle.code} · ${serviceVehicle.name}`
        : null,
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
