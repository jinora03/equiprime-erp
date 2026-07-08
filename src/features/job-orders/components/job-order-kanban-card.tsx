import { CalendarClock, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/shared/components/priority-badge";
import { formatDate } from "@/utils/format";
import type { JobOrder } from "../types";

/** A single Job Order rendered as a Kanban card. */
export function JobOrderKanbanCard({
  jobOrder,
  onClick,
}: {
  jobOrder: JobOrder;
  onClick?: () => void;
}) {
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
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1 truncate">
          <User className="h-3.5 w-3.5" />
          {jobOrder.assignee ?? "Unassigned"}
        </span>
        <span className="flex items-center gap-1">
          <CalendarClock className="h-3.5 w-3.5" />
          {formatDate(jobOrder.dueDate)}
        </span>
      </div>
    </div>
  );
}
