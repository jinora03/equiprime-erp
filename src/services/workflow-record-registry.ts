import type { WorkflowRecord } from "@/types";

/**
 * Tiny in-memory registry used only by the demo workflow editor to protect
 * stages that still contain records. Registered arrays remain live as stores
 * mutate during the browser session.
 */
const recordSources = new Map<string, WorkflowRecord[]>();

export function registerWorkflowRecordSource<T extends WorkflowRecord>(
  moduleId: string,
  records: T[],
): void {
  recordSources.set(moduleId, records);
}

export function countWorkflowRecordsInStage(
  moduleId: string,
  stageId: string,
): number {
  return (recordSources.get(moduleId) ?? []).filter(
    (record) => record.currentStageId === stageId,
  ).length;
}
