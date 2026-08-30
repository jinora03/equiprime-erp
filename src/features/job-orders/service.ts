import { customerService } from "@/features/customers/service";
import { equipmentService } from "@/features/equipment/service";
import { arePartsReleasedForCycle } from "@/features/parts/rules";
import { partsRequestService } from "@/features/parts/service";
import { areAllWorkItemsComplete } from "@/features/work-items/statuses";
import { workItemService } from "@/features/work-items/service";
import {
  createRecordStore,
  historyEntry,
  nextRecordId,
} from "@/services/workflow-records";
import {
  canUpdateJobOrder,
  canViewJobOrder,
  type ServiceWorkActor,
} from "@/services/service-work-access";
import {
  getInitialWorkflowStageId,
  type WorkflowMoveEvidence,
} from "@/services/workflow-rules";
import { userService } from "@/services/user.service";
import { workflowService } from "@/services/workflow.service";
import {
  requireMockPermission,
  requireMockSessionActor,
} from "@/services/mock/session-context";
import { getActiveOrganizationScope } from "@/store/organization.store";
import { jobOrderSeed } from "./data";
import { serviceVehicleService } from "./service-vehicle-service";
import type { CreateJobOrderRequest, JobOrder, JobOrderResponse } from "./types";
import type { OrganizationScope } from "@/types";

const store = createRecordStore<JobOrder>("job-orders", jobOrderSeed, {
  resolveWorkflow: (record) =>
    record.workflowId
      ? workflowService.get(record.workflowId, record.workflowVersion)
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
      partsReleased: arePartsReleasedForCycle(partsRequests, record.partsCycle),
      supervisorApproved: false,
      qaPassed: false,
    };
  },
  onStageMoved: (record, fromStageId, toStageId) => {
    if (fromStageId !== "jo-waiting-parts" && toStageId === "jo-waiting-parts") {
      record.partsCycle += 1;
    }
  },
});
let counter = Math.max(
  ...jobOrderSeed.map((job) => Number(job.code.split("-").at(-1) ?? 0)),
);

export const jobOrderService = {
  ...store,
  async listForCurrentActor(scope?: OrganizationScope): Promise<JobOrderResponse[]> {
    const session = requireMockSessionActor();
    const actor: ServiceWorkActor = {
      userId: session.id,
      role: session.role,
      permissions: session.permissions,
    };
    const records = await store.list(scope);
    return records.filter((record) => canViewJobOrder(actor, record));
  },

  async moveStage(
    id: number,
    toStageId: string,
    input: { note?: string; evidence?: WorkflowMoveEvidence } = {},
  ): Promise<JobOrder> {
    const session = requireMockSessionActor();
    const actor: ServiceWorkActor = {
      userId: session.id,
      role: session.role,
      permissions: session.permissions,
    };
    const record = await store.get(id);
    if (!canUpdateJobOrder(actor, record)) {
      throw new Error("You can only update job orders available to your account.");
    }
    return store.moveStage(id, toStageId, {
      actor: session.name,
      actorId: session.id,
      actorRole: session.role,
      permissions: session.permissions,
      note: input.note,
      evidence: input.evidence,
    });
  },

  async create(input: CreateJobOrderRequest): Promise<JobOrderResponse> {
    const now = new Date().toISOString();
    const session = requireMockPermission("job-orders:create");
    const scope = getActiveOrganizationScope();
    if (input.assigneeIds.length === 0) {
      throw new Error("Assign at least one mechanic before creating a job order.");
    }
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
      history: [historyEntry(null, firstStage, session.name, undefined, now)],
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
      workflowVersion: workflow.version,
      priority: input.priority,
      partsCycle: 0,
      dueDate: input.dueDate,
      description: input.description,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    };
    return store.add(record);
  },
};
