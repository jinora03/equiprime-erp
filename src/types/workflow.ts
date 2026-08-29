/**
 * Workflow Engine — generic types.
 *
 * The engine is intentionally module-agnostic. Job Orders, Projects, and
 * Maintenance consume configurable workflows; Work Items intentionally use
 * fixed statuses. These interfaces also keep the mock/API boundary aligned so
 * a future backend can replace mock services without changing consumers.
 */

export type WorkflowStatus = "active" | "draft" | "archived";

/** Visual tone for a stage — drives the timeline + status badge colors. */
export type WorkflowTone =
  | "slate"
  | "blue"
  | "amber"
  | "violet"
  | "green"
  | "orange"
  | "red";

export interface WorkflowStage {
  id: string;
  name: string;
  description?: string;
  /** 1-based position within the workflow. */
  order: number;
  tone: WorkflowTone;
}

/** Condition types a transition can require before it is allowed. */
export type TransitionConditionType =
  | "parts_released"
  | "supervisor_approval"
  | "all_work_items_completed"
  | "qa_passed";

export interface TransitionCondition {
  type: TransitionConditionType;
  label: string;
}

/** Allowed movement between two stages, with optional gate conditions + approvals. */
export interface WorkflowTransition {
  id: string;
  workflowId?: number;
  fromStageId: string;
  toStageId: string;
  label?: string;
  /** Conditions evaluated by the transition engine before movement is allowed. */
  conditions?: TransitionCondition[];
  /** Roles that must approve before movement (runtime "waiting for approval"). */
  approverRoles?: string[];
}

export interface Workflow {
  id: number;
  /** Immutable revision number; edits create a new version. */
  version: number;
  name: string;
  description?: string;
  /** Module the workflow drives, e.g. "job-orders". */
  moduleId: string;
  moduleLabel: string;
  status: WorkflowStatus;
  stages: WorkflowStage[];
  transitions?: WorkflowTransition[];
  updatedBy: string;
  updatedAt: string;
}

/** One movement of a record through the workflow. */
export interface WorkflowHistory {
  id: string;
  fromStageId: string | null;
  toStageId: string;
  actor: string;
  note?: string;
  at: string; // ISO
}

/** Assignment of a record's current stage to a user (reserved for future use). */
export interface WorkflowAssignment {
  id: string;
  recordId: number;
  moduleId: string;
  stageId: string;
  assigneeId: number;
  assigneeName: string;
  assignedAt: string;
}

/**
 * Base shape shared by every workflow-driven business record. Business modules
 * extend this with their own fields (customer, equipment, etc.).
 */
export interface WorkflowRecord {
  id: number;
  code: string;
  title: string;
  moduleId: string;
  /** Exact workflow revision this record follows. */
  workflowId: number;
  workflowVersion: number;
  companyId: string;
  branchId: string;
  currentStageId: string;
  history: WorkflowHistory[];
  assignee?: string | null;
  createdAt: string;
  updatedAt: string;
}
