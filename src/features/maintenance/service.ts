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
import { maintenanceSeed } from "./data";
import type { CreateMaintenanceRequest, Maintenance, MaintenanceResponse } from "./types";

const store = createRecordStore<Maintenance>("maintenance", maintenanceSeed);
let counter = maintenanceSeed.length;

export const maintenanceService = {
  ...store,
  async moveStage(
    id: number,
    toStageId: string,
    input: { note?: string; evidence?: WorkflowMoveEvidence } = {},
  ): Promise<MaintenanceResponse> {
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

  async create(input: CreateMaintenanceRequest): Promise<MaintenanceResponse> {
    const now = new Date().toISOString();
    const actor = requireMockPermission("maintenance:create");
    const scope = getActiveOrganizationScope();
    const workflow = await workflowService.getByModule("maintenance");
    if (!workflow) {
      throw new Error("No active Maintenance workflow is configured.");
    }
    const firstStage = getInitialWorkflowStageId(workflow);
    counter += 1;

    const record: Maintenance = {
      id: nextRecordId(),
      code: `MNT-2026-${String(counter).padStart(4, "0")}`,
      title: `${input.type} — ${input.equipment}`,
      moduleId: "maintenance",
      workflowId: workflow.id,
      workflowVersion: workflow.version,
      companyId: scope.companyId,
      branchId: scope.branchId,
      currentStageId: firstStage,
      history: [historyEntry(null, firstStage, actor.name, undefined, now)],
      assignee: input.assignee || null,
      equipment: input.equipment,
      type: input.type,
      priority: input.priority,
      scheduledDate: input.scheduledDate,
      createdAt: now,
      updatedAt: now,
    };
    return store.add(record);
  },
};
