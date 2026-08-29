import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Eye,
  Inbox,
  ShieldCheck,
  UserRound,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useBranches } from "@/hooks/use-organizations";
import { getErrorMessage } from "@/services/api/errors";
import { usePermissions } from "@/hooks/use-permissions";
import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";
import { useOrganizationScope } from "@/store/organization.store";
import { formatDateTime, formatRelativeTime } from "@/utils/format";
import type { ApprovalTask } from "@/types";
import {
  ApprovalReviewDialog,
  type ApprovalDialogMode,
} from "../components/approval-review-dialog";
import { useDecideApproval, useMyApprovals } from "../hooks";

export function ApprovalsPage() {
  const { user } = useAuth();
  const { can, isSuperAdmin } = usePermissions();
  const scope = useOrganizationScope();
  const { data: branches = [] } = useBranches(scope.companyId);
  const { data: tasks = [], isLoading } = useMyApprovals();
  const decide = useDecideApproval();
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [selected, setSelected] = useState<ApprovalTask | null>(null);
  const [dialogMode, setDialogMode] = useState<ApprovalDialogMode>("review");
  const [actingTaskId, setActingTaskId] = useState<string | null>(null);

  const branchById = new Map(branches.map((branch) => [branch.id, branch]));
  const visible = useMemo(
    () =>
      tasks.filter((task) =>
        tab === "pending" ? task.status === "pending" : task.status !== "pending",
      ),
    [tasks, tab],
  );
  const pendingCount = tasks.filter((task) => task.status === "pending").length;
  const selectedCanAct =
    selected != null &&
    selected.status === "pending" &&
    can("approvals:act") &&
    (isSuperAdmin ||
      !selected.decisions.some((decision) => decision.role === user?.role));

  const openDecision = (task: ApprovalTask, mode: ApprovalDialogMode) => {
    setSelected(task);
    setDialogMode(mode);
  };

  const act = async (
    task: ApprovalTask,
    decision: "approve" | "reject",
    note?: string,
  ) => {
    setActingTaskId(task.id);
    try {
      const updated = await decide.mutateAsync({
        taskId: task.id,
        decision,
        note,
      });
      if (selected?.id === task.id) setSelected(null);
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
        description: getErrorMessage(error, "Try again."),
      });
    } finally {
      setActingTaskId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div data-onboarding="approvals">
        <PageHeader
          title="My Approvals"
          description="Review requests assigned to your role, with enough context to make a safe decision quickly."
        />
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pendingCount > 0 ? (
              <Badge variant="warning" className="ml-1.5 px-1.5 py-0">
                {pendingCount}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Loading approvals…
          </CardContent>
        </Card>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={
            tab === "pending" ? "No approvals waiting" : "No approval history"
          }
          description={
            tab === "pending"
              ? "There are no approval requests assigned to your role in this branch."
              : "Approved and rejected requests will appear here."
          }
        />
      ) : (
        <div className="space-y-3">
          {visible.map((task) => {
            const canAct =
              task.status === "pending" &&
              can("approvals:act") &&
              (isSuperAdmin ||
                !task.decisions.some(
                  (decision) => decision.role === user?.role,
                ));
            const alreadyApproved =
              task.status === "pending" &&
              task.decisions.some((decision) => decision.role === user?.role);
            const primaryAssignment = task.approverAssignments?.find(
              (assignment) => assignment.people.length > 0,
            );
            const primaryApprover = primaryAssignment?.people[0];
            const approverName =
              primaryApprover?.name ?? task.requiredRoles.join(", ");
            const approverRole =
              primaryAssignment?.role ??
              (task.requiredRoles.length === 1
                ? task.requiredRoles[0]
                : `${task.requiredRoles.length} required roles`);

            return (
              <Card key={task.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start">
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
                        <span className="font-mono text-xs text-muted-foreground">
                          {task.recordCode}
                        </span>
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

                      <p className="mt-1.5 font-semibold text-foreground">
                        {task.recordTitle}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {task.transitionLabel}: {task.fromStageName} →{" "}
                        {task.toStageName}
                      </p>

                      <div className="mt-4 grid gap-3 border-t pt-4 text-xs sm:grid-cols-3">
                        <ApprovalMeta
                          icon={UserRound}
                          label="Requested by"
                          value={task.requestedByName}
                          detail={task.requestedByRole}
                        />
                        <ApprovalMeta
                          icon={ShieldCheck}
                          label="Approver"
                          value={approverName}
                          detail={approverRole}
                        />
                        <ApprovalMeta
                          icon={Clock3}
                          label="Requested"
                          value={formatRelativeTime(task.requestedAt)}
                          detail={formatDateTime(task.requestedAt)}
                        />
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
                      {canAct ? (
                        <>
                          <Button
                            size="sm"
                            disabled={decide.isPending}
                            onClick={() => void act(task, "approve")}
                          >
                            {actingTaskId === task.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => openDecision(task, "reject")}
                          >
                            <XCircle className="h-4 w-4" /> Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDecision(task, "review")}
                          >
                            <Eye className="h-4 w-4" /> Review
                          </Button>
                        </>
                      ) : alreadyApproved ? (
                        <Badge variant="success">Your role approved</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDecision(task, "review")}
                        >
                          <Eye className="h-4 w-4" /> Review
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ApprovalReviewDialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        task={selected}
        mode={dialogMode}
        branchName={
          selected ? branchById.get(selected.branchId)?.displayName : undefined
        }
        actionable={selectedCanAct}
        submitting={decide.isPending}
        onApprove={(note) => {
          if (!selected) return;
          return act(selected, "approve", note);
        }}
        onReject={(note) => {
          if (!selected) return;
          return act(selected, "reject", note);
        }}
      />
    </div>
  );
}

function ApprovalMeta({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-muted-foreground">{label}</p>
        <p className="mt-0.5 break-words font-medium text-foreground">{value}</p>
        {detail ? <p className="mt-0.5 break-words text-muted-foreground">{detail}</p> : null}
      </div>
    </div>
  );
}
