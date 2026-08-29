import {
  createRecordStore,
  historyEntry,
  nextRecordId,
} from "@/services/workflow-records";
import { getInitialWorkflowStageId } from "@/services/workflow-rules";
import { workflowService } from "@/services/workflow.service";
import { getActiveOrganizationScope } from "@/store/organization.store";
import { maintenanceSeed } from "./data";
import type { Maintenance, MaintenanceInput } from "./types";

const store = createRecordStore<Maintenance>("maintenance", maintenanceSeed);
let counter = maintenanceSeed.length;

export const maintenanceService = {
  ...store,
  async create(input: MaintenanceInput): Promise<Maintenance> {
    const now = new Date().toISOString();
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
      history: [historyEntry(null, firstStage, input.actor, undefined, now)],
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
