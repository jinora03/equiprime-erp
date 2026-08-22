import { Check, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getWorkItemStatusAction,
  type WorkItemStatus,
} from "../statuses";

interface WorkItemStatusActionButtonProps {
  status: WorkItemStatus;
  disabled?: boolean;
  onChange: (status: WorkItemStatus) => void;
}

/**
 * Shared action for the fixed Work Item lifecycle.
 * Authorization is decided by the caller and re-checked by the service.
 */
export function WorkItemStatusActionButton({
  status,
  disabled = false,
  onChange,
}: WorkItemStatusActionButtonProps) {
  const action = getWorkItemStatusAction(status);
  const Icon =
    action.label === "Start"
      ? Play
      : action.label === "Complete"
        ? Check
        : RotateCcw;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 gap-1.5 px-2 text-xs"
      disabled={disabled}
      onClick={() => onChange(action.nextStatus)}
      aria-label={`${action.label} work item`}
    >
      <Icon className="h-3.5 w-3.5" />
      {action.label}
    </Button>
  );
}
