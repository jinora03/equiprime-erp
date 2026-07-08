import { cn } from "@/lib/utils";
import type { WorkflowStage } from "@/types";
import { TONE } from "./workflow-tones";

interface WorkflowStageBadgeProps {
  stage?: WorkflowStage | null;
  className?: string;
}

/** Status pill showing a record's current workflow stage, colored by tone. */
export function WorkflowStageBadge({ stage, className }: WorkflowStageBadgeProps) {
  if (!stage) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const tone = TONE[stage.tone] ?? TONE.slate;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone.badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
      {stage.name}
    </span>
  );
}
