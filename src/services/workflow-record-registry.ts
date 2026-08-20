import type { WorkflowRecord } from "@/types";

/**
 * Tiny in-memory registry shared by mock workflow services. Registered arrays
 * remain live as stores mutate during the browser session. It supports editor
 * safety checks and lightweight cross-record validation without coupling mock
 * feature services directly to one another.
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
