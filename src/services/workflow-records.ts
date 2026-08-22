import { WILDCARD } from "@/constants/modules";
import { delay } from "@/services/mock/delay";
import { matchesOrganizationScope } from "@/services/mock/scope";
import {
  registerWorkflowApprovalOperations,
  registerWorkflowRecordSource,
} from "@/services/workflow-record-registry";
import {
  EMPTY_CONDITION_CONTEXT,
  blockedWorkflowMove,
  evaluateWorkflowApprovalRequest,
  evaluateWorkflowMove,
  type ConditionContext,
  type WorkflowMoveEvidence,
  type WorkflowMoveEvaluation,
} from "@/services/workflow-rules";
import { workflowService } from "@/services/workflow.service";
import type {
  OrganizationScope,
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
  actorId?: number;
  permissions: PermissionKey[];
  actorRole?: string | null;
  note?: string;
  evidence?: WorkflowMoveEvidence;
}

export interface RecordStore<T extends WorkflowRecord> {
  list: (scope?: OrganizationScope) => Promise<T[]>;
  get: (id: number, scope?: OrganizationScope) => Promise<T>;
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

  const findRecord = (id: number) =>
    data.find(
      (record) => record.id === id && matchesOrganizationScope(record),
    );

  const resolveWorkflow = (record: T) =>
    options.resolveWorkflow
      ? options.resolveWorkflow(record)
      : workflowService.getByModule(moduleId);

  const resolveConditionContext = (record: T) =>
    options.getConditionContext
      ? options.getConditionContext(record)
      : Promise.resolve(EMPTY_CONDITION_CONTEXT);

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

    const [workflow, conditionContext] = await Promise.all([
      resolveWorkflow(record),
      resolveConditionContext(record),
    ]);
    if (!workflow) {
      return blockedWorkflowMove("No active workflow is configured for this module.");
    }

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

  const validateApprovalRequest = async (
    id: number,
    toStageId: string,
    input: {
      actorRole?: string | null;
      permissions: PermissionKey[];
      confirmedConditions?: WorkflowMoveEvidence["confirmedConditions"];
    },
  ): Promise<WorkflowMoveEvaluation> => {
    const record = findRecord(id);
    if (!record) return blockedWorkflowMove("Record not found.");

    const [workflow, conditionContext] = await Promise.all([
      resolveWorkflow(record),
      resolveConditionContext(record),
    ]);
    if (!workflow) {
      return blockedWorkflowMove("No active workflow is configured for this module.");
    }

    return evaluateWorkflowApprovalRequest(
      workflow,
      record.currentStageId,
      toStageId,
      conditionContext,
      {
        permissions: input.permissions,
        actorRole: input.actorRole,
        evidence: {
          confirmedConditions: input.confirmedConditions,
        },
      },
    );
  };

  const moveStage = async (
    id: number,
    toStageId: string,
    input: WorkflowMoveInput,
  ): Promise<T> => {
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
  };

  registerWorkflowApprovalOperations(moduleId, {
    validateApprovalRequest,
    applyApprovedMove: (id, toStageId, input) =>
      moveStage(id, toStageId, {
        actor: input.actor,
        // Approval service is the trusted mock-domain orchestrator. A future
        // backend performs this same final transition after authorization.
        permissions: [WILDCARD],
        evidence: {
          confirmedConditions: input.confirmedConditions,
          approvedRoles: input.approvedRoles,
        },
        note: input.note,
      }),
  });

  return {
    list: (scope) =>
      delay(
        data
          .filter((record) => matchesOrganizationScope(record, scope))
          .map((r) => ({ ...r, history: [...r.history] })),
      ),

    get: (id, scope) => {
      const record = data.find(
        (item) => item.id === id && matchesOrganizationScope(item, scope),
      );
      if (!record) return Promise.reject(new Error("Record not found"));
      return delay({ ...record, history: [...record.history] });
    },

    add: (record) => {
      data.unshift(record);
      return delay({ ...record, history: [...record.history] });
    },

    validateMove,
    moveStage,
  };
}
