import { cn } from "@/lib/utils";
import { TONE } from "@/shared/components/workflow-tones";
import { getWorkItemStatus, type WorkItemStatus } from "../statuses";

/** Status pill for a work item's fixed status (Not Started / In Progress / Completed). */
export function WorkItemStatusChip({ status }: { status: WorkItemStatus }) {
  const def = getWorkItemStatus(status);
  const tone = TONE[def.tone] ?? TONE.slate;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone.badge,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
      {def.label}
    </span>
  );
}
