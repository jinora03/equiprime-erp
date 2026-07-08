import { isWorkItemComplete } from "@/features/work-items/statuses";
import type { WorkItem } from "@/features/work-items/types";
import type { WorkflowStage } from "@/types";

/**
 * Business rule (Phase 1: warning only): a Job Order shouldn't be marked
 * Completed/Closed while it still has incomplete work items. Detection is
 * data-driven off the workflow stage name — no backend validation.
 */
export const isCompletionStage = (stage?: WorkflowStage | null): boolean =>
  !!stage && /complete|closed/i.test(stage.name);

export const countIncompleteWorkItems = (items: WorkItem[]): number =>
  items.filter((w) => !isWorkItemComplete(w.status)).length;
