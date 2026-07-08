import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";
import type { WorkflowHistory, WorkflowStage } from "@/types";

interface WorkflowHistoryListProps {
  history: WorkflowHistory[];
  stages: WorkflowStage[];
  className?: string;
}

/** Vertical audit feed of a record's stage transitions (newest first). */
export function WorkflowHistoryList({
  history,
  stages,
  className,
}: WorkflowHistoryListProps) {
  const stageName = (id: string | null) =>
    (id && stages.find((s) => s.id === id)?.name) || "—";

  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
    );
  }

  const items = [...history].reverse();

  return (
    <ol className={cn("space-y-0", className)}>
      {items.map((entry, i) => (
        <li key={entry.id} className="relative flex gap-3 pb-4 last:pb-0">
          {i < items.length - 1 ? (
            <span className="absolute left-[7px] top-4 h-full w-px bg-border" />
          ) : null}
          <span className="z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-primary bg-background" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground">
              {entry.fromStageId ? (
                <>
                  Moved to{" "}
                  <span className="font-medium">
                    {stageName(entry.toStageId)}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    from {stageName(entry.fromStageId)}
                  </span>
                </>
              ) : (
                <>
                  Created in{" "}
                  <span className="font-medium">
                    {stageName(entry.toStageId)}
                  </span>
                </>
              )}
            </p>
            {entry.note ? (
              <p className="mt-0.5 text-xs italic text-muted-foreground">
                “{entry.note}”
              </p>
            ) : null}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {entry.actor} · {formatRelativeTime(entry.at)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
