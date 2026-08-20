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
  availableStageIds: string[];
  onMove: (toStageId: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

/** Controls only the transitions the shared workflow rules expose as allowed. */
export function StageMover({
  stages,
  availableStageIds,
  onMove,
  disabled,
  loading,
}: StageMoverProps) {
  const available = availableStageIds
    .map((id) => stages.find((stage) => stage.id === id))
    .filter((stage): stage is WorkflowStage => Boolean(stage));
  const primary = available[0];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={() => primary && onMove(primary.id)}
        disabled={disabled || loading || !primary}
      >
        {loading
          ? "Updating…"
          : primary
            ? `Advance to ${primary.name}`
            : "No available transition"}
        {primary && !loading ? <ChevronRight className="h-4 w-4" /> : null}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled || loading || available.length === 0}
          >
            <GitBranch className="h-4 w-4" />
            Move to…
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Allowed transitions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {available.map((stage) => (
            <DropdownMenuItem key={stage.id} onClick={() => onMove(stage.id)}>
              {stage.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
