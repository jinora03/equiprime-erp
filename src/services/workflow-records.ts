import { delay } from "@/services/mock/delay";
import type { WorkflowHistory, WorkflowRecord } from "@/types";

/**
 * Generic in-memory store for workflow-driven business records. Every Service
 * module (Job Orders, Work Items, Projects, Maintenance) builds its service on
 * top of this, so stage-movement + history logic lives in exactly one place.
 *
 * Replace this with repository calls to FastAPI later — the module services and
 * UI stay identical.
 */

let seq = 5000;
export const nextRecordId = () => ++seq;

export function historyEntry(
  fromStageId: string | null,
  toStageId: string,
  actor: string,
  note?: string,
  at?: string,
): WorkflowHistory {
  return {
    id: `h-${Math.random().toString(36).slice(2, 9)}`,
    fromStageId,
    toStageId,
    actor,
    note,
    at: at ?? new Date().toISOString(),
  };
}

export interface RecordStore<T extends WorkflowRecord> {
  list: () => Promise<T[]>;
  get: (id: number) => Promise<T>;
  add: (record: T) => Promise<T>;
  moveStage: (
    id: number,
    toStageId: string,
    actor: string,
    note?: string,
  ) => Promise<T>;
}

export function createRecordStore<T extends WorkflowRecord>(
  seed: T[],
): RecordStore<T> {
  const data: T[] = seed.map((r) => ({ ...r, history: [...r.history] }));

  return {
    list: () => delay(data.map((r) => ({ ...r }))),

    get: (id) => {
      const record = data.find((r) => r.id === id);
      if (!record) return Promise.reject(new Error("Record not found"));
      return delay({ ...record });
    },

    add: (record) => {
      data.unshift(record);
      return delay({ ...record });
    },

    moveStage: (id, toStageId, actor, note) => {
      const record = data.find((r) => r.id === id);
      if (!record) return Promise.reject(new Error("Record not found"));
      if (record.currentStageId !== toStageId) {
        record.history = [
          ...record.history,
          historyEntry(record.currentStageId, toStageId, actor, note),
        ];
        record.currentStageId = toStageId;
        record.updatedAt = new Date().toISOString();
      }
      return delay({ ...record });
    },
  };
}
