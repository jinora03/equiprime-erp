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
  { id: "in_progress", label: "In Progress", tone: "amber" },
  { id: "completed", label: "Completed", tone: "green" },
];

export function getWorkItemStatus(id: WorkItemStatus): WorkItemStatusDef {
  return WORK_ITEM_STATUSES.find((s) => s.id === id) ?? WORK_ITEM_STATUSES[0];
}

export const isWorkItemComplete = (status: WorkItemStatus) =>
  status === "completed";
