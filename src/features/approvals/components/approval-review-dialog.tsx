import { useEffect, useState } from "react";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { ApprovalTask } from "@/types";

interface ApprovalReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ApprovalTask | null;
  submitting?: boolean;
  onApprove: (note?: string) => void | Promise<void>;
  onReject: (note: string) => void | Promise<void>;
}

export function ApprovalReviewDialog({
  open,
  onOpenChange,
  task,
  submitting,
  onApprove,
  onReject,
}: ApprovalReviewDialogProps) {
  const [note, setNote] = useState("");
  const [pendingDecision, setPendingDecision] = useState<"approve" | "reject" | null>(null);

  useEffect(() => {
    if (open) {
      setNote("");
      setPendingDecision(null);
    }
  }, [open, task?.id]);

  const handleApprove = async () => {
    setPendingDecision("approve");
    try {
      await onApprove(note.trim() || undefined);
    } finally {
      setPendingDecision(null);
    }
  };

  const handleReject = async () => {
    setPendingDecision("reject");
    try {
      await onReject(note);
    } finally {
      setPendingDecision(null);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Review approval</DialogTitle>
          <DialogDescription>
            Review this request without needing access to the full {task.moduleLabel} source module.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{task.moduleLabel}</Badge>
              <span className="font-mono text-xs text-muted-foreground">{task.recordCode}</span>
            </div>
            <p className="mt-2 font-medium text-foreground">{task.recordTitle}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary">{task.fromStageName}</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="brand">{task.toStageName}</Badge>
            </div>
          </div>

          {task.context.length > 0 ? (
            <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
              {task.context.map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-sm text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Required approval
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {task.requiredRoles.map((role) => {
                const approved = task.decisions.some((decision) => decision.role === role);
                return (
                  <Badge key={role} variant={approved ? "success" : "secondary"}>
                    {role}{approved ? " approved" : ""}
                  </Badge>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Requested by {task.requestedByName} ({task.requestedByRole}).
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="approval-note" className="text-sm font-medium text-foreground">
              Decision note
            </label>
            <Textarea
              id="approval-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional for approval; required when rejecting."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={submitting || !note.trim()}
          >
            {pendingDecision === "reject" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Rejecting…
              </>
            ) : (
              "Reject"
            )}
          </Button>
          <Button onClick={handleApprove} disabled={submitting}>
            {pendingDecision === "approve" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Approving…
              </>
            ) : (
              "Approve"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
