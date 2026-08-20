import type { WorkflowMoveEvaluation } from "@/services/workflow-rules";
import type {
  PermissionKey,
  TransitionConditionType,
  WorkflowRecord,
} from "@/types";

/**
 * Tiny in-memory registry shared by mock workflow services. Registered arrays
 * remain live as stores mutate during the browser session. It supports editor
 * safety checks and lightweight cross-record validation without coupling mock
 * feature services directly to one another.
 */
const recordSources = new Map<string, WorkflowRecord[]>();

interface ApprovalRequestValidationInput {
  actorRole?: string | null;
  permissions: PermissionKey[];
  confirmedConditions?: TransitionConditionType[];
}

interface ApprovedMoveInput {
  actor: string;
  approvedRoles: string[];
  confirmedConditions?: TransitionConditionType[];
  note?: string;
}

interface WorkflowApprovalOperations {
  validateApprovalRequest: (
    recordId: number,
    toStageId: string,
    input: ApprovalRequestValidationInput,
  ) => Promise<WorkflowMoveEvaluation>;
  applyApprovedMove: (
    recordId: number,
    toStageId: string,
    input: ApprovedMoveInput,
  ) => Promise<WorkflowRecord>;
}

const approvalOperations = new Map<string, WorkflowApprovalOperations>();

export function registerWorkflowRecordSource<T extends WorkflowRecord>(
  moduleId: string,
  records: T[],
): void {
  recordSources.set(moduleId, records);
}

export function registerWorkflowApprovalOperations(
  moduleId: string,
  operations: WorkflowApprovalOperations,
): void {
  approvalOperations.set(moduleId, operations);
}

export function countWorkflowRecordsInStage(
  moduleId: string,
  stageId: string,
): number {
  return (recordSources.get(moduleId) ?? []).filter(
    (record) => record.currentStageId === stageId,
  ).length;
}

export function findRegisteredWorkflowRecord<T extends WorkflowRecord>(
  moduleId: string,
  recordId: number,
): T | null {
  return (
    (recordSources.get(moduleId) ?? []).find((record) => record.id === recordId) as
      | T
      | undefined
  ) ?? null;
}

export function validateRegisteredApprovalRequest(
  moduleId: string,
  recordId: number,
  toStageId: string,
  input: ApprovalRequestValidationInput,
): Promise<WorkflowMoveEvaluation> {
  const operations = approvalOperations.get(moduleId);
  if (!operations) {
    return Promise.reject(new Error("This module does not support workflow approvals."));
  }
  return operations.validateApprovalRequest(recordId, toStageId, input);
}

export function applyRegisteredApprovedMove(
  moduleId: string,
  recordId: number,
  toStageId: string,
  input: ApprovedMoveInput,
): Promise<WorkflowRecord> {
  const operations = approvalOperations.get(moduleId);
  if (!operations) {
    return Promise.reject(new Error("This module does not support workflow approvals."));
  }
  return operations.applyApprovedMove(recordId, toStageId, input);
}
