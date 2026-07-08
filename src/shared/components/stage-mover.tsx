import { ChevronRight, GitBranch } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WorkflowStage } from "@/types";

interface StageMoverProps {
  stages: WorkflowStage[];
  currentStageId: string;
  onMove: (toStageId: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Controls to move a record through its workflow: a primary "advance to next"
 * button plus a menu to jump to any stage. Generic — every Service module reuses
 * it via the detail sheet.
 */
export function StageMover({
  stages,
  currentStageId,
  onMove,
  disabled,
  loading,
}: StageMoverProps) {
  const ordered = [...stages].sort((a, b) => a.order - b.order);
  const currentOrder =
    ordered.find((s) => s.id === currentStageId)?.order ?? 0;
  const next = ordered.find((s) => s.order === currentOrder + 1);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={() => next && onMove(next.id)}
        disabled={disabled || loading || !next}
      >
        {loading
          ? "Updating…"
          : next
            ? `Advance to ${next.name}`
            : "Final stage reached"}
        {next && !loading ? <ChevronRight className="h-4 w-4" /> : null}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={disabled || loading}>
            <GitBranch className="h-4 w-4" />
            Move to…
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Set stage</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ordered.map((stage) => (
            <DropdownMenuItem
              key={stage.id}
              disabled={stage.id === currentStageId}
              onClick={() => onMove(stage.id)}
            >
              {stage.name}
              {stage.id === currentStageId ? (
                <span className="ml-auto text-xs text-muted-foreground">
                  current
                </span>
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
