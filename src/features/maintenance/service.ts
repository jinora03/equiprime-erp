import {
  createRecordStore,
  historyEntry,
  nextRecordId,
} from "@/services/workflow-records";
import { maintenanceSeed } from "./data";
import type { Maintenance, MaintenanceInput } from "./types";

const store = createRecordStore<Maintenance>(maintenanceSeed);
let counter = maintenanceSeed.length;

export const maintenanceService = {
  ...store,
  create(input: MaintenanceInput): Promise<Maintenance> {
    const now = new Date().toISOString();
    counter += 1;
    const record: Maintenance = {
      id: nextRecordId(),
      code: `MNT-2026-${String(counter).padStart(4, "0")}`,
      title: `${input.type} — ${input.equipment}`,
      moduleId: "maintenance",
      currentStageId: "mt-scheduled",
      history: [
        historyEntry(null, "mt-scheduled", input.actor, undefined, now),
      ],
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
