import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { History, Workflow as WorkflowIcon } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import type { Workflow } from "@/types";
import { StageMover } from "./stage-mover";
import { WorkflowHistoryList } from "./workflow-history-list";
import { WorkflowStageBadge } from "./workflow-stage-badge";
import { WorkflowTimeline } from "./workflow-timeline";

export interface DetailMeta {
  label: string;
  value: ReactNode;
}

interface WorkflowDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  title: string;
  icon?: LucideIcon;
  meta: DetailMeta[];
  workflow: Workflow | null | undefined;
  currentStageId: string;
  history: import("@/types").WorkflowHistory[];
  canMove?: boolean;
  moving?: boolean;
  onMoveStage: (toStageId: string) => void;
  /** Extra content rendered between the workflow section and history. */
  children?: ReactNode;
}

/**
 * Reusable detail drawer for any workflow-driven record. Renders the current
 * stage, the full workflow timeline, stage-movement controls, module-specific
 * content, and the transition history — so all four Service modules share one
 * detail experience.
 */
export function WorkflowDetailSheet({
  open,
  onOpenChange,
  code,
  title,
  icon: Icon,
  meta,
  workflow,
  currentStageId,
  history,
  canMove = false,
  moving = false,
  onMoveStage,
  children,
}: WorkflowDetailSheetProps) {
  const currentStage =
    workflow?.stages.find((s) => s.id === currentStageId) ?? null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-xl"
      >
        <SheetHeader>
          <div className="flex items-start gap-3">
            {Icon ? (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-muted-foreground">{code}</p>
              <SheetTitle className="truncate">{title}</SheetTitle>
              <SheetDescription className="sr-only">
                Record details and workflow
              </SheetDescription>
              <div className="mt-1.5">
                <WorkflowStageBadge stage={currentStage} />
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Meta */}
        {meta.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-4">
            {meta.map((m) => (
              <div key={m.label} className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {m.label}
                </p>
                <div className="mt-1 truncate text-sm text-foreground">
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <Separator className="my-6" />

        {/* Workflow */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <WorkflowIcon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              {workflow ? workflow.name : "Workflow"}
            </h3>
          </div>
          {workflow ? (
            <>
              <WorkflowTimeline
                stages={workflow.stages}
                currentStageId={currentStageId}
              />
              {canMove ? (
                <StageMover
                  stages={workflow.stages}
                  currentStageId={currentStageId}
                  onMove={onMoveStage}
                  loading={moving}
                />
              ) : (
                <p className="text-xs text-muted-foreground">
                  You have read-only access to this record.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No workflow is configured for this module.
            </p>
          )}
        </section>

        {children ? (
          <>
            <Separator className="my-6" />
            {children}
          </>
        ) : null}

        <Separator className="my-6" />

        {/* History */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">History</h3>
          </div>
          <WorkflowHistoryList
            history={history}
            stages={workflow?.stages ?? []}
          />
        </section>
      </SheetContent>
    </Sheet>
  );
}
