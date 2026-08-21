import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, Inbox, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";
import { formatRelativeTime } from "@/utils/format";
import type { ApprovalTask } from "@/types";
import { ApprovalReviewDialog } from "../components/approval-review-dialog";
import { useDecideApproval, useMyApprovals } from "../hooks";

export function ApprovalsPage() {
  const { user, permissions } = useAuth();
  const { can, isSuperAdmin } = usePermissions();
  const { data: tasks = [], isLoading } = useMyApprovals();
  const decide = useDecideApproval();
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [selected, setSelected] = useState<ApprovalTask | null>(null);

  const visible = useMemo(
    () =>
      tasks.filter((task) =>
        tab === "pending" ? task.status === "pending" : task.status !== "pending",
      ),
    [tasks, tab],
  );
  const pendingCount = tasks.filter((task) => task.status === "pending").length;

  const actor = user
    ? { id: user.id, name: user.full_name, role: user.role, permissions }
    : null;

  const act = async (decision: "approve" | "reject", note?: string) => {
    if (!selected || !actor) return;
    try {
      const updated = await decide.mutateAsync({
        taskId: selected.id,
        decision,
        actor,
        note,
      });
      setSelected(null);
      if (decision === "reject") {
        toast.success("Approval rejected", {
          description: `${updated.recordCode} remains in ${updated.fromStageName}.`,
        });
      } else if (updated.status === "approved") {
        toast.success("Approval completed", {
          description:
            updated.kind === "parts_request"
              ? `${updated.recordCode} was approved and released.`
              : `${updated.recordCode} moved to ${updated.toStageName}.`,
        });
      } else {
        toast.success("Approval recorded", {
          description: "The request is waiting for the remaining required role.",
        });
      }
    } catch (error) {
      toast.error("Approval action failed", {
        description: error instanceof Error ? error.message : "Try again.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div data-onboarding="approvals">
        <PageHeader
          title="My Approvals"
          description="Review business and workflow requests assigned to your role for the active branch."
        />
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pendingCount > 0 ? (
              <Badge variant="brand" className="ml-1.5 px-1.5 py-0">
                {pendingCount}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading approvals…</CardContent>
        </Card>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={tab === "pending" ? "No approvals waiting" : "No approval history"}
          description={
            tab === "pending"
              ? "There are no approval requests assigned to your role in this branch."
              : "Approved and rejected requests will appear here."
          }
        />
      ) : (
        <div className="space-y-3">
          {visible.map((task) => (
            <Card key={task.id}>
              <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {task.status === "approved" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : task.status === "rejected" ? (
                    <XCircle className="h-5 w-5" />
                  ) : (
                    <ShieldCheck className="h-5 w-5" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{task.recordCode}</span>
                    <Badge variant="outline">{task.moduleLabel}</Badge>
                    <Badge
                      variant={
                        task.status === "approved"
                          ? "success"
                          : task.status === "rejected"
                            ? "destructive"
                            : task.status === "cancelled"
                              ? "secondary"
                              : "warning"
                      }
                    >
                      {task.status}
                    </Badge>
                  </div>
                  <p className="mt-1 font-medium text-foreground">{task.recordTitle}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {task.transitionLabel}: {task.fromStageName} → {task.toStageName}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    Requested by {task.requestedByName} {formatRelativeTime(task.requestedAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  {task.requiredRoles.map((role) => (
                    <Badge key={role} variant="secondary">{role}</Badge>
                  ))}
                  {task.status === "pending" &&
                  can("approvals:act") &&
                  (isSuperAdmin ||
                    !task.decisions.some((decision) => decision.role === user?.role)) ? (
                    <Button onClick={() => setSelected(task)}>Review</Button>
                  ) : task.status === "pending" &&
                    task.decisions.some((decision) => decision.role === user?.role) ? (
                    <Badge variant="success">Your role approved</Badge>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ApprovalReviewDialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        task={selected}
        submitting={decide.isPending}
        onApprove={(note) => act("approve", note)}
        onReject={(note) => act("reject", note)}
      />
    </div>
  );
}
