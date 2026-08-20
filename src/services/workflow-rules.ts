import { WILDCARD } from "@/constants/modules";
import type {
  PermissionKey,
  TransitionCondition,
  TransitionConditionType,
  Workflow,
  WorkflowStage,
  WorkflowTransition,
} from "@/types";
import { hasPermission } from "@/utils/rbac";

/**
 * Shared workflow domain rules used by both the mock services and the UI.
 * The service layer always re-evaluates a move before mutating a record.
 */

export interface ConditionContext {
  allWorkItemsCompleted: boolean;
  partsReleased: boolean;
  supervisorApproved: boolean;
  qaPassed: boolean;
}

export const EMPTY_CONDITION_CONTEXT: ConditionContext = {
  allWorkItemsCompleted: false,
  partsReleased: false,
  supervisorApproved: false,
  qaPassed: false,
};

/** Conditions derived from current mock data rather than user confirmation. */
export const AUTO_CONDITIONS: TransitionConditionType[] = [
  "parts_released",
  "all_work_items_completed",
];

/** Conditions that require an explicit confirmation in the transition dialog. */
export const MANUAL_CONDITIONS: TransitionConditionType[] = [
  "supervisor_approval",
  "qa_passed",
];

export const isManualCondition = (type: TransitionConditionType) =>
  MANUAL_CONDITIONS.includes(type);

function orderedStages(workflow: Workflow): WorkflowStage[] {
  return [...workflow.stages].sort((a, b) => a.order - b.order);
}

/** First configured stage is the single start-stage convention for this demo. */
export function getInitialWorkflowStageId(workflow: Workflow): string {
  const first = orderedStages(workflow)[0];
  if (!first) throw new Error(`Workflow "${workflow.name}" has no stages.`);
  return first.id;
}

/**
 * Explicit transitions win when a workflow defines them. Workflows without a
 * transition graph use a conservative sequential fallback: only the next
 * configured stage is reachable, never an arbitrary stage jump.
 */
export function getOutgoingTransitions(
  workflow: Workflow | null | undefined,
  fromStageId: string,
): WorkflowTransition[] {
  if (!workflow) return [];

  if (workflow.transitions !== undefined) {
    return workflow.transitions.filter((t) => t.fromStageId === fromStageId);
  }

  const stages = orderedStages(workflow);
  const currentIndex = stages.findIndex((s) => s.id === fromStageId);
  const next = currentIndex >= 0 ? stages[currentIndex + 1] : undefined;
  return next
    ? [
        {
          id: `implicit:${fromStageId}:${next.id}`,
          fromStageId,
          toStageId: next.id,
        },
      ]
    : [];
}

export function isConditionMet(
  type: TransitionConditionType,
  ctx: ConditionContext,
): boolean {
  switch (type) {
    case "parts_released":
      return ctx.partsReleased;
    case "all_work_items_completed":
      return ctx.allWorkItemsCompleted;
    case "supervisor_approval":
      return ctx.supervisorApproved;
    case "qa_passed":
      return ctx.qaPassed;
    default:
      return false;
  }
}

export interface EvaluatedCondition {
  condition: TransitionCondition;
  met: boolean;
  manual: boolean;
}

export interface TransitionEvaluation {
  conditions: EvaluatedCondition[];
  approverRoles: string[];
  conditionsMet: boolean;
}

export function evaluateTransition(
  transition: WorkflowTransition,
  ctx: ConditionContext,
): TransitionEvaluation {
  const conditions: EvaluatedCondition[] = (transition.conditions ?? []).map(
    (condition) => ({
      condition,
      met: isConditionMet(condition.type, ctx),
      manual: isManualCondition(condition.type),
    }),
  );
  return {
    conditions,
    approverRoles: transition.approverRoles ?? [],
    conditionsMet: conditions.every((c) => c.met),
  };
}

export interface WorkflowMoveEvidence {
  confirmedConditions?: TransitionConditionType[];
  approvedRoles?: string[];
}

export interface WorkflowMoveActor {
  permissions: PermissionKey[];
  actorRole?: string | null;
  evidence?: WorkflowMoveEvidence;
}

export interface WorkflowMoveEvaluation extends TransitionEvaluation {
  transition: WorkflowTransition | null;
  approvalsMet: boolean;
  allowed: boolean;
  reason?: string;
}

export function blockedWorkflowMove(reason: string): WorkflowMoveEvaluation {
  return {
    transition: null,
    conditions: [],
    approverRoles: [],
    conditionsMet: false,
    approvalsMet: false,
    allowed: false,
    reason,
  };
}

function withConfirmedManualConditions(
  ctx: ConditionContext,
  evidence?: WorkflowMoveEvidence,
): ConditionContext {
  const next = { ...ctx };
  for (const type of evidence?.confirmedConditions ?? []) {
    // Evidence can never be used to self-assert an automatic data condition.
    if (!isManualCondition(type)) continue;
    if (type === "supervisor_approval") next.supervisorApproved = true;
    if (type === "qa_passed") next.qaPassed = true;
  }
  return next;
}

/**
 * Evaluate whether a workflow move is ready to be submitted for role approval.
 * The requester must still be allowed to update the record and satisfy every
 * configured condition; only the approver-role requirement is deferred.
 */
export function evaluateWorkflowApprovalRequest(
  workflow: Workflow,
  fromStageId: string,
  toStageId: string,
  conditionContext: ConditionContext,
  actor: WorkflowMoveActor,
): WorkflowMoveEvaluation {
  const updatePermission = `${workflow.moduleId}:update`;
  if (!hasPermission(actor.permissions, updatePermission)) {
    return blockedWorkflowMove(
      "You don't have permission to request this workflow transition.",
    );
  }

  const transition = getOutgoingTransitions(workflow, fromStageId).find(
    (candidate) => candidate.toStageId === toStageId,
  );
  if (!transition) {
    const current = workflow.stages.find((stage) => stage.id === fromStageId);
    const target = workflow.stages.find((stage) => stage.id === toStageId);
    return blockedWorkflowMove(
      current && target
        ? `Moving from ${current.name} to ${target.name} is not an allowed transition.`
        : "The requested workflow transition does not exist.",
    );
  }

  const approverRoles = transition.approverRoles ?? [];
  if (approverRoles.length === 0) {
    return blockedWorkflowMove("This transition does not require role approval.");
  }

  // Reuse the authoritative move evaluator for conditions and transition rules.
  // Wildcard is used only inside this domain helper after the requester's update
  // permission was checked above; approvals are deliberately deferred to the
  // approval-task service.
  return evaluateWorkflowMove(workflow, fromStageId, toStageId, conditionContext, {
    permissions: [WILDCARD],
    actorRole: actor.actorRole,
    evidence: {
      ...actor.evidence,
      approvedRoles: approverRoles,
    },
  });
}

/** Evaluate the complete rules for one requested record move. */
export function evaluateWorkflowMove(
  workflow: Workflow,
  fromStageId: string,
  toStageId: string,
  conditionContext: ConditionContext,
  actor: WorkflowMoveActor,
): WorkflowMoveEvaluation {
  const current = workflow.stages.find((s) => s.id === fromStageId);
  if (!current) {
    return blockedWorkflowMove("The record's current workflow stage no longer exists.");
  }

  const target = workflow.stages.find((s) => s.id === toStageId);
  if (!target) return blockedWorkflowMove("The requested workflow stage does not exist.");

  const updatePermission = `${workflow.moduleId}:update`;
  if (!hasPermission(actor.permissions, updatePermission)) {
    return blockedWorkflowMove("You don't have permission to update this record's workflow stage.");
  }

  const transition = getOutgoingTransitions(workflow, fromStageId).find(
    (candidate) => candidate.toStageId === toStageId,
  );
  if (!transition) {
    return blockedWorkflowMove(
      `Moving from ${current.name} to ${target.name} is not an allowed transition.`,
    );
  }

  const effectiveContext = withConfirmedManualConditions(
    conditionContext,
    actor.evidence,
  );
  const evaluated = evaluateTransition(transition, effectiveContext);
  const unmet = evaluated.conditions.find((condition) => !condition.met);
  if (unmet) {
    return {
      ...evaluated,
      transition,
      approvalsMet: false,
      allowed: false,
      reason: unmet.manual
        ? `${unmet.condition.label} must be confirmed from the record detail before this move.`
        : `${unmet.condition.label} is not satisfied.`,
    };
  }

  const approved = new Set(actor.evidence?.approvedRoles ?? []);
  const canApproveAnyRole = actor.permissions.includes(WILDCARD);
  const missingApproval = evaluated.approverRoles.find((role) => {
    if (!approved.has(role)) return true;
    return !canApproveAnyRole && actor.actorRole !== role;
  });

  if (missingApproval) {
    const canApprove = canApproveAnyRole || actor.actorRole === missingApproval;
    return {
      ...evaluated,
      transition,
      approvalsMet: false,
      allowed: false,
      reason: canApprove
        ? `${missingApproval} approval must be completed through My Approvals.`
        : `${missingApproval} approval is required; request it from the record detail and complete it through My Approvals.`,
    };
  }

  return {
    ...evaluated,
    transition,
    approvalsMet: true,
    allowed: true,
  };
}
