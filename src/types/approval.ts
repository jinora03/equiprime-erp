import type { PermissionKey } from "./permission";
import type { TransitionConditionType } from "./workflow";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface ApprovalContextItem {
  label: string;
  value: string;
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
  companyId: string;
  branchId: string;
  workflowId: number;
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

export interface ApprovalActor {
  id: number;
  name: string;
  role: string;
  permissions: PermissionKey[];
}

export interface ApprovalRequestInput {
  moduleId: string;
  recordId: number;
  toStageId: string;
  transitionId: string;
  actor: ApprovalActor;
  confirmedConditions?: TransitionConditionType[];
}

export interface ApprovalDecisionInput {
  taskId: string;
  decision: "approve" | "reject";
  actor: ApprovalActor;
  note?: string;
}
