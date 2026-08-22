import type { WorkflowTone } from "@/types";

/**
 * Work Items use a small, FIXED status set — intentionally NOT the configurable
 * Workflow Engine (which drives Job Orders). Statuses live here as data, not
 * hardcoded inside UI components, so a configurable work-item workflow can
 * replace this later with minimal changes.
 */

export type WorkItemStatus = "not_started" | "in_progress" | "completed";

export interface WorkItemStatusDef {
  id: WorkItemStatus;
  label: string;
  tone: WorkflowTone;
}

export const WORK_ITEM_STATUSES: WorkItemStatusDef[] = [
  { id: "not_started", label: "Not Started", tone: "slate" },
  { id: "in_progress", label: "In Progress", tone: "blue" },
  { id: "completed", label: "Completed", tone: "green" },
];

export function getWorkItemStatus(id: WorkItemStatus): WorkItemStatusDef {
  return WORK_ITEM_STATUSES.find((s) => s.id === id) ?? WORK_ITEM_STATUSES[0];
}

export const isWorkItemComplete = (status: WorkItemStatus) =>
  status === "completed";

/**
 * A completion gate should represent actual completed work, not the vacuous
 * truth of Array.every() on an empty list.
 */
export function areAllWorkItemsComplete(
  items: ReadonlyArray<{ status: WorkItemStatus }>,
): boolean {
  return items.length > 0 && items.every((item) => isWorkItemComplete(item.status));
}

export interface WorkItemStatusAction {
  label: "Start" | "Complete" | "Reopen";
  nextStatus: WorkItemStatus;
}

/**
 * User-facing action for the small fixed work-item lifecycle. The status stays
 * available for display/filtering, while the UI can present a natural action
 * instead of asking users to choose a state from a dropdown.
 */
export function getWorkItemStatusAction(
  status: WorkItemStatus,
): WorkItemStatusAction {
  switch (status) {
    case "not_started":
      return { label: "Start", nextStatus: "in_progress" };
    case "in_progress":
      return { label: "Complete", nextStatus: "completed" };
    case "completed":
      return { label: "Reopen", nextStatus: "in_progress" };
  }

  const exhaustiveStatus: never = status;
  return exhaustiveStatus;
}

/** Fixed lifecycle rule shared by every Work Item interaction surface. */
export function canTransitionWorkItemStatus(
  from: WorkItemStatus,
  to: WorkItemStatus,
): boolean {
  if (from === to) return true;
  return getWorkItemStatusAction(from).nextStatus === to;
}
