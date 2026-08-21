import { Building2, ClipboardCheck, GitBranch, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OnboardingWelcomeDialogProps {
  open: boolean;
  stepCount: number;
  onSkip: () => void;
  onStart: () => void;
}

export function OnboardingWelcomeDialog({
  open,
  stepCount,
  onSkip,
  onStart,
}: OnboardingWelcomeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onSkip()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <DialogTitle>Welcome to Equiprime</DialogTitle>
          <DialogDescription>
            Take a short, role-aware tour of the connected ERP demo. It takes
            about a minute and can be replayed anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-xl border bg-muted/30 p-4 text-sm">
          <div className="flex gap-3">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-muted-foreground">
              See how company and branch scope changes connected demo data.
            </p>
          </div>
          <div className="flex gap-3">
            <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-muted-foreground">
              Follow Job Orders through service workflows and related records.
            </p>
          </div>
          <div className="flex gap-3">
            <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-muted-foreground">
              Approval guidance appears only when your role can access it.
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {stepCount} guided {stepCount === 1 ? "step" : "steps"} for your current access.
        </p>

        <DialogFooter>
          <Button variant="ghost" onClick={onSkip}>
            Skip tour
          </Button>
          <Button onClick={onStart}>Take a quick tour</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
