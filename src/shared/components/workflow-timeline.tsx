import { Fragment } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { WorkflowStage } from "@/types";

interface WorkflowTimelineProps {
  stages: WorkflowStage[];
  currentStageId: string;
  className?: string;
}

/**
 * Horizontal stage stepper. Completed stages are filled/checked, the current
 * stage is highlighted, upcoming stages are muted. Scrolls horizontally when
 * space is tight (e.g. inside a drawer).
 */
export function WorkflowTimeline({
  stages,
  currentStageId,
  className,
}: WorkflowTimelineProps) {
  const ordered = [...stages].sort((a, b) => a.order - b.order);
  const currentOrder =
    ordered.find((s) => s.id === currentStageId)?.order ?? 0;

  return (
    <div
      className={cn(
        "flex w-full overflow-x-auto overscroll-x-contain pb-4 [scrollbar-width:thin]",
        className,
      )}
    >
      {ordered.map((stage, i) => {
        const state =
          stage.order < currentOrder
            ? "done"
            : stage.order === currentOrder
              ? "current"
              : "upcoming";
        const incomingDone = stage.order <= currentOrder && i > 0;

        return (
          <Fragment key={stage.id}>
            <div className="relative flex min-w-[84px] flex-1 flex-col items-center">
              {/* incoming connector (left half) */}
              {i > 0 ? (
                <span
                  className={cn(
                    "absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2",
                    incomingDone ? "bg-primary" : "bg-border",
                  )}
                />
              ) : null}
              {/* outgoing connector (right half) */}
              {i < ordered.length - 1 ? (
                <span
                  className={cn(
                    "absolute left-1/2 top-4 h-0.5 w-full -translate-y-1/2",
                    stage.order < currentOrder ? "bg-primary" : "bg-border",
                  )}
                />
              ) : null}

              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background text-xs font-semibold transition-colors",
                  state === "done" &&
                    "border-primary bg-primary text-primary-foreground",
                  state === "current" &&
                    "border-primary bg-background text-primary ring-4 ring-primary/15",
                  state === "upcoming" &&
                    "border-border text-muted-foreground",
                )}
              >
                {state === "done" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  stage.order
                )}
              </div>
              <span
                className={cn(
                  "mt-2 max-w-[92px] text-center text-[11px] leading-tight",
                  state === "upcoming"
                    ? "text-muted-foreground"
                    : "font-medium text-foreground",
                )}
              >
                {stage.name}
              </span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
