import type {
  TransitionCondition,
  TransitionConditionType,
  Workflow,
  WorkflowTransition,
} from "@/types";

/**
 * Pure transition engine. The workflow is the single source of truth: it
 * declares which transitions are allowed and what gates each one. Job Orders
 * never hardcode this logic — they call the engine. Backend-ready: the same
 * `context` will later be assembled from API responses.
 */

export interface ConditionContext {
  allWorkItemsCompleted: boolean;
  partsReleased: boolean;
  supervisorApproved: boolean;
  qaPassed: boolean;
}

/** Conditions derived from live data (read-only in the UI). */
export const AUTO_CONDITIONS: TransitionConditionType[] = [
  "parts_released",
  "all_work_items_completed",
];

/** Conditions satisfied by a runtime confirmation (supervisor / QA sign-off). */
export const MANUAL_CONDITIONS: TransitionConditionType[] = [
  "supervisor_approval",
  "qa_passed",
];

export const isManualCondition = (type: TransitionConditionType) =>
  MANUAL_CONDITIONS.includes(type);

export function getOutgoingTransitions(
  workflow: Workflow | null | undefined,
  fromStageId: string,
): WorkflowTransition[] {
  return (workflow?.transitions ?? []).filter(
    (t) => t.fromStageId === fromStageId,
  );
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
  /** True when every condition is satisfied. */
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
