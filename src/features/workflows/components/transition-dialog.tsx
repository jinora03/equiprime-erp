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
  requestingApproval?: boolean;
  onConfirm: (
    toStageId: string,
    evidence: WorkflowMoveEvidence,
  ) => void | Promise<void>;
  onRequestApproval: (
    toStageId: string,
    evidence: WorkflowMoveEvidence,
  ) => void | Promise<void>;
}

/**
 * Reviews transition gates before a move. Manual conditions can be confirmed in
 * the record detail; configured role approvals are routed to My Approvals rather
 * than being self-confirmed inside the module.
 */
export function TransitionDialog({
  open,
  onOpenChange,
  transition,
  toStageName,
  context,
  confirming,
  requestingApproval,
  onConfirm,
  onRequestApproval,
}: TransitionDialogProps) {
  const [manual, setManual] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) setManual({});
  }, [open, transition?.id]);

  if (!transition) return null;

  const effectiveContext: ConditionContext = {
    ...context,
    supervisorApproved: context.supervisorApproved || !!manual.supervisor_approval,
    qaPassed: context.qaPassed || !!manual.qa_passed,
  };
  const result = evaluateTransition(transition, effectiveContext);
  const requiresApproval = result.approverRoles.length > 0;
  const busy = Boolean(confirming || requestingApproval);
  const evidence: WorkflowMoveEvidence = {
    confirmedConditions: result.conditions
      .filter((condition) => condition.manual && condition.met)
      .map((condition) => condition.condition.type),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to {toStageName}</DialogTitle>
          <DialogDescription>
            Review the configured transition requirements. Role approvals are
            sent to My Approvals and are not granted from this screen.
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
                      setManual((current) => ({
                        ...current,
                        [condition.type]: true,
                      }))
                    }
                  >
                    Confirm
                  </Button>
                ) : (
                  <Badge variant="destructive" className="shrink-0 whitespace-nowrap">
                    Not met
                  </Badge>
                )}
              </div>
            ))}
          </section>
        ) : null}

        {requiresApproval ? (
          <section className="space-y-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Approval route
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Requesting this transition creates a task for each configured
                approver role. The record stays in its current stage until the
                required approvals are completed.
              </p>
            </div>
            {result.approverRoles.map((role) => (
              <div
                key={role}
                className="flex items-center justify-between gap-3 rounded-lg border p-2.5"
              >
                <span className="flex items-center gap-2 text-sm text-foreground">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  {role}
                </span>
                <Badge variant="secondary">Via My Approvals</Badge>
              </div>
            ))}
          </section>
        ) : null}

        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            disabled={!result.conditionsMet || busy}
            onClick={() =>
              requiresApproval
                ? onRequestApproval(transition.toStageId, evidence)
                : onConfirm(transition.toStageId, evidence)
            }
          >
            {busy
              ? requiresApproval
                ? "Requesting…"
                : "Moving…"
              : requiresApproval
                ? "Request approval"
                : "Confirm & move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
