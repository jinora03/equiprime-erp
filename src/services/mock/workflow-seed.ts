import { historyEntry } from "@/services/workflow-records";
import type { WorkflowHistory } from "@/types";

/**
 * Build a believable history feed for a seeded record: a "created" entry in the
 * first stage, then one transition per stage up to the record's current stage.
 */
export function seedHistory(
  stageIds: string[],
  currentStageId: string,
  actor: string,
  startISO: string,
): WorkflowHistory[] {
  const currentIndex = Math.max(stageIds.indexOf(currentStageId), 0);
  const start = new Date(startISO).getTime();
  const entries: WorkflowHistory[] = [];
  for (let i = 0; i <= currentIndex; i++) {
    entries.push(
      historyEntry(
        i === 0 ? null : stageIds[i - 1],
        stageIds[i],
        actor,
        undefined,
        new Date(start + i * 6 * 3_600_000).toISOString(),
      ),
    );
  }
  return entries;
}
