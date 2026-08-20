import { delay } from "@/services/mock/delay";
import { registerWorkflowRecordSource } from "@/services/workflow-record-registry";
import {
  EMPTY_CONDITION_CONTEXT,
  blockedWorkflowMove,
  evaluateWorkflowMove,
  type ConditionContext,
  type WorkflowMoveEvidence,
  type WorkflowMoveEvaluation,
} from "@/services/workflow-rules";
import { workflowService } from "@/services/workflow.service";
import type {
  PermissionKey,
  Workflow,
  WorkflowHistory,
  WorkflowRecord,
} from "@/types";

/**
 * Generic in-memory store for configurable workflow-driven business records.
 * Stage mutation and final transition validation live here so list/detail/
 * Kanban surfaces cannot apply different workflow rules.
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

export interface WorkflowMoveInput {
  actor: string;
  permissions: PermissionKey[];
  actorRole?: string | null;
  note?: string;
  evidence?: WorkflowMoveEvidence;
}

export interface RecordStore<T extends WorkflowRecord> {
  list: () => Promise<T[]>;
  get: (id: number) => Promise<T>;
  add: (record: T) => Promise<T>;
  validateMove: (
    id: number,
    toStageId: string,
    input: WorkflowMoveInput,
  ) => Promise<WorkflowMoveEvaluation>;
  moveStage: (
    id: number,
    toStageId: string,
    input: WorkflowMoveInput,
  ) => Promise<T>;
}

interface RecordStoreOptions<T extends WorkflowRecord> {
  resolveWorkflow?: (record: T) => Promise<Workflow | null>;
  getConditionContext?: (record: T) => Promise<ConditionContext>;
}

export function createRecordStore<T extends WorkflowRecord>(
  moduleId: string,
  seed: T[],
  options: RecordStoreOptions<T> = {},
): RecordStore<T> {
  const data: T[] = seed.map((r) => ({ ...r, history: [...r.history] }));
  registerWorkflowRecordSource(moduleId, data);

  const findRecord = (id: number) => data.find((record) => record.id === id);

  const validateMove = async (
    id: number,
    toStageId: string,
    input: WorkflowMoveInput,
  ): Promise<WorkflowMoveEvaluation> => {
    const record = findRecord(id);
    if (!record) return blockedWorkflowMove("Record not found.");

    if (record.currentStageId === toStageId) {
      return {
        transition: null,
        conditions: [],
        approverRoles: [],
        conditionsMet: true,
        approvalsMet: true,
        allowed: true,
      };
    }

    const workflow = options.resolveWorkflow
      ? await options.resolveWorkflow(record)
      : await workflowService.getByModule(moduleId);
    if (!workflow) {
      return blockedWorkflowMove("No active workflow is configured for this module.");
    }

    const conditionContext = options.getConditionContext
      ? await options.getConditionContext(record)
      : EMPTY_CONDITION_CONTEXT;

    return evaluateWorkflowMove(
      workflow,
      record.currentStageId,
      toStageId,
      conditionContext,
      {
        permissions: input.permissions,
        actorRole: input.actorRole,
        evidence: input.evidence,
      },
    );
  };

  return {
    list: () => delay(data.map((r) => ({ ...r, history: [...r.history] }))),

    get: (id) => {
      const record = findRecord(id);
      if (!record) return Promise.reject(new Error("Record not found"));
      return delay({ ...record, history: [...record.history] });
    },

    add: (record) => {
      data.unshift(record);
      return delay({ ...record, history: [...record.history] });
    },

    validateMove,

    async moveStage(id, toStageId, input) {
      const record = findRecord(id);
      if (!record) throw new Error("Record not found");
      if (record.currentStageId === toStageId) {
        return delay({ ...record, history: [...record.history] });
      }

      const evaluation = await validateMove(id, toStageId, input);
      if (!evaluation.allowed) {
        throw new Error(evaluation.reason ?? "This workflow move is not allowed.");
      }

      record.history = [
        ...record.history,
        historyEntry(record.currentStageId, toStageId, input.actor, input.note),
      ];
      record.currentStageId = toStageId;
      record.updatedAt = new Date().toISOString();
      return delay({ ...record, history: [...record.history] });
    },
  };
}
