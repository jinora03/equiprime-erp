import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/shared/components/priority-badge";
import type { JobOrder } from "../types";

/** A single Job Order rendered as a Kanban card. */
export function JobOrderKanbanCard({
  jobOrder,
  onClick,
}: {
  jobOrder: JobOrder;
  onClick?: () => void;
}) {
  const primaryMechanic =
    jobOrder.assignee?.split(",")[0]?.trim() || "Unassigned";

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-card p-3 shadow-soft transition-shadow",
        onClick && "cursor-pointer hover:shadow-card",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-[11px] text-muted-foreground">
          {jobOrder.code}
        </p>
        <PriorityBadge priority={jobOrder.priority} />
      </div>
      <p className="mt-1 text-sm font-medium leading-snug text-foreground">
        {jobOrder.title}
      </p>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">
        {jobOrder.customer}
      </p>
      <p
        className="mt-3 truncate text-xs text-muted-foreground"
        title={jobOrder.assignee ?? undefined}
      >
        {primaryMechanic}
      </p>
    </div>
  );
}
