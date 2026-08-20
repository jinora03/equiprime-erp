import { useEffect, useState } from "react";
import { CheckCircle2, Circle, ShieldCheck } from "lucide-react";

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
import { cn } from "@/lib/utils";
import type { WorkflowTransition } from "@/types";
import {
  evaluateTransition,
  type ConditionContext,
  type WorkflowMoveEvidence,
} from "../transition-engine";

interface TransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transition: WorkflowTransition | null;
  toStageName: string;
  context: ConditionContext;
  confirming?: boolean;
  actorRole?: string | null;
  canApproveAnyRole?: boolean;
  onConfirm: (
    toStageId: string,
    evidence: WorkflowMoveEvidence,
  ) => void | Promise<void>;
}

/**
 * Shows a transition's gate conditions + required approvals. Manual conditions
 * (supervisor/QA sign-off) and approvals are satisfied here at runtime — this is
 * NOT a workflow stage, just a pre-transition checklist. Confirm is enabled only
 * once every condition is met and every approver has approved.
 */
export function TransitionDialog({
  open,
  onOpenChange,
  transition,
  toStageName,
  context,
  confirming,
  actorRole,
  canApproveAnyRole = false,
  onConfirm,
}: TransitionDialogProps) {
  const [manual, setManual] = useState<Record<string, boolean>>({});
  const [approvals, setApprovals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setManual({});
      setApprovals({});
    }
  }, [open, transition?.id]);

  if (!transition) return null;

  const effectiveContext: ConditionContext = {
    ...context,
    supervisorApproved: context.supervisorApproved || !!manual.supervisor_approval,
    qaPassed: context.qaPassed || !!manual.qa_passed,
  };
  const result = evaluateTransition(transition, effectiveContext);
  const allApproved = result.approverRoles.every((r) => approvals[r]);
  const canConfirm = result.conditionsMet && allApproved;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to {toStageName}</DialogTitle>
          <DialogDescription>
            Review the transition requirements. Manual confirmations and role
            approvals are simulated in this browser-only demo.
          </DialogDescription>
        </DialogHeader>

        {result.conditions.length > 0 ? (
          <section className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Conditions
            </p>
            {result.conditions.map(({ condition, met, manual: isManual }) => (
              <div
                key={condition.type}
                className="flex items-center justify-between gap-3 rounded-lg border p-2.5"
              >
                <span className="flex items-center gap-2 text-sm text-foreground">
                  {met ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  {condition.label}
                </span>
                {met ? (
                  <Badge variant="success">Met</Badge>
                ) : isManual ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setManual((m) => ({ ...m, [condition.type]: true }))
                    }
                  >
                    Confirm
                  </Button>
                ) : (
                  <Badge variant="warning">Not met</Badge>
                )}
              </div>
            ))}
          </section>
        ) : null}

        {result.approverRoles.length > 0 ? (
          <section className="space-y-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Simulated approvals
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Only the required role (or a full-access demo role) can provide each sign-off.
              </p>
            </div>
            {result.approverRoles.map((role) => {
              const canApprove = canApproveAnyRole || actorRole === role;
              return (
                <div
                  key={role}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg border p-2.5",
                    approvals[role] && "border-success/40 bg-success/[0.04]",
                  )}
                >
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    {role}
                  </span>
                  {approvals[role] ? (
                    <Badge variant="success">Approved</Badge>
                  ) : canApprove ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Pending</Badge>
                      <Button
                        size="sm"
                        onClick={() =>
                          setApprovals((a) => ({ ...a, [role]: true }))
                        }
                      >
                        Approve
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="warning">Requires {role}</Badge>
                  )}
                </div>
              );
            })}
          </section>
        ) : null}

        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={confirming}
          >
            Cancel
          </Button>
          <Button
            disabled={!canConfirm || confirming}
            onClick={() =>
              onConfirm(transition.toStageId, {
                confirmedConditions: result.conditions
                  .filter((condition) => condition.manual && condition.met)
                  .map((condition) => condition.condition.type),
                approvedRoles: result.approverRoles.filter(
                  (role) => approvals[role],
                ),
              })
            }
          >
            {confirming ? "Moving…" : "Confirm & move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
