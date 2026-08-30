import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

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
import { formatDateTime } from "@/utils/format";

export type ApprovalDialogMode = "review" | "reject";

interface ApprovalReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ApprovalTask | null;
  mode?: ApprovalDialogMode;
  branchName?: string;
  actionable?: boolean;
  submitting?: boolean;
  onApprove: (note?: string) => void | Promise<void>;
  onReject: (note: string) => void | Promise<void>;
}

export function ApprovalReviewDialog({
  open,
  onOpenChange,
  task,
  mode = "review",
  branchName,
  actionable = true,
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
  }, [open, task?.id, mode]);

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
      await onReject(note.trim());
    } finally {
      setPendingDecision(null);
    }
  };

  if (!task) return null;

  const title = mode === "reject" ? "Reject approval" : "Review approval";
  const description =
    mode === "reject"
      ? "Add a reason so the requester knows what needs to change."
      : `Review the full request context, then approve or reject from here.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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

          {mode === "review" && task.context.length > 0 ? (
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
              Approval routing
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Requested by</p>
                <p className="mt-0.5 text-sm font-medium text-foreground">
                  {task.requestedByName}
                </p>
                <p className="text-xs text-muted-foreground">{task.requestedByRole}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Requested at</p>
                <p className="mt-0.5 text-sm font-medium text-foreground">
                  {formatDateTime(task.requestedAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {branchName ?? task.branchId}
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-2 border-t pt-3">
              {task.requiredRoles.map((role) => {
                const approved = task.decisions.some((decision) => decision.role === role);
                const assignment = task.approverAssignments?.find(
                  (candidate) => candidate.role === role,
                );
                const approver = assignment?.people[0];
                return (
                  <div key={role} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">
                        {approver?.name ?? role}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {approver ? role : "No active approver found"}
                      </p>
                    </div>
                    <Badge variant={approved ? "success" : "outline"}>
                      {approved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="approval-note" className="text-sm font-medium text-foreground">
              {mode === "reject" ? "Rejection reason" : "Decision note"}
            </label>
            <Textarea
              id="approval-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={
                mode === "reject"
                  ? "Explain what needs to be corrected before resubmission."
                  : "Optional note for this decision."
              }
              rows={3}
              autoFocus={mode === "reject"}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>

          {actionable && (mode === "review" || mode === "reject") ? (
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
                <>
                  <XCircle className="h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
          ) : null}

          {actionable && mode === "review" ? (
            <Button onClick={handleApprove} disabled={submitting}>
              {pendingDecision === "approve" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Approving…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </>
              )}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
