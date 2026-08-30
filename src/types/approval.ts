import type { PermissionKey } from "./permission";
import type { TransitionConditionType } from "./workflow";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "cancelled";
export type ApprovalKind = "workflow_transition" | "parts_request";

export interface ApprovalContextItem {
  label: string;
  value: string;
}

export interface ApprovalApproverPerson {
  id: number;
  name: string;
  jobTitle?: string | null;
}

export interface ApprovalApproverAssignment {
  role: string;
  people: ApprovalApproverPerson[];
}

export interface ApprovalDecision {
  role: string;
  actorId: number;
  actorName: string;
  actorRole: string;
  at: string;
  note?: string;
}

export interface ApprovalTask {
  id: string;
  kind: ApprovalKind;
  companyId: string;
  branchId: string;
  workflowId: number;
  workflowVersion: number;
  moduleId: string;
  moduleLabel: string;
  recordId: number;
  recordCode: string;
  recordTitle: string;
  transitionId: string;
  transitionLabel: string;
  fromStageId: string;
  fromStageName: string;
  toStageId: string;
  toStageName: string;
  requiredRoles: string[];
  /** Active people in this branch who can satisfy each required role. */
  approverAssignments?: ApprovalApproverAssignment[];
  confirmedConditions: TransitionConditionType[];
  context: ApprovalContextItem[];
  requestedById: number;
  requestedByName: string;
  requestedByRole: string;
  requestedAt: string;
  status: ApprovalStatus;
  decisions: ApprovalDecision[];
  rejectedBy?: ApprovalDecision;
  resolvedAt?: string;
}

/** Stable read DTO returned by the Approvals service/API. */
export type ApprovalTaskResponse = ApprovalTask;

export interface ApprovalActor {
  id: number;
  name: string;
  role: string;
  permissions: PermissionKey[];
}

/**
 * Backend-ready approval command. Actor identity/role/permissions are omitted on
 * purpose: Laravel must derive the requester from the authenticated session and
 * independently validate the transition and required approver roles.
 */
export interface CreateApprovalRequest {
  moduleId: string;
  recordId: number;
  toStageId: string;
  transitionId: string;
  confirmedConditions?: TransitionConditionType[];
}

/**
 * Approval decision command. `taskId`, decision, and optional business note are
 * client intent only; the backend must determine who is acting and whether that
 * actor is an eligible approver.
 */
export interface DecideApprovalRequest {
  taskId: string;
  decision: "approve" | "reject";
  note?: string;
}
