import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Lock,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ScrollableTabsList,
  Tabs,
  TabsContent,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";
import { usePermissions } from "@/hooks/use-permissions";
import { useRequestApproval } from "@/features/approvals/hooks";
import { useMoveRecordStage } from "@/hooks/use-workflow-records";
import { EmptyState } from "@/shared/components/empty-state";
import { PriorityBadge } from "@/shared/components/priority-badge";
import { WorkflowHistoryList } from "@/shared/components/workflow-history-list";
import { WorkflowStageBadge } from "@/shared/components/workflow-stage-badge";
import { WorkflowTimeline } from "@/shared/components/workflow-timeline";
import { formatCurrency, formatDate, formatRelativeTime } from "@/utils/format";
import { useWorkflow } from "@/features/workflows/hooks";
import { useWorkItems } from "@/features/work-items/hooks";
import {
  areAllWorkItemsComplete,
  getWorkItemStatus,
} from "@/features/work-items/statuses";
import { usePartsRequests } from "@/features/parts/hooks";
import { arePartsReleasedForCycle } from "@/features/parts/rules";
import {
  getOutgoingTransitions,
  type ConditionContext,
} from "@/features/workflows/transition-engine";
import { TransitionDialog } from "@/features/workflows/components/transition-dialog";
import type { WorkflowTransition } from "@/types";
import type { WorkflowMoveEvidence } from "@/services/workflow-rules";
import { jobOrderService } from "../service";
import { JobOrderWorkItemsTab } from "../components/job-order-work-items-tab";
import { JobOrderPartsTab } from "../components/job-order-parts-tab";
import {
  useJobOrderAttachments,
  useJobOrderLabor,
  useJobOrders,
} from "../hooks";

const TABS = [
  "overview",
  "workflow",
  "work-items",
  "parts",
  "labor",
  "attachments",
  "timeline",
  "history",
];

export function JobOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const jobOrderId = Number(id);
  const navigate = useNavigate();
  const { can } = usePermissions();

  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.includes(searchParams.get("tab") ?? "")
    ? (searchParams.get("tab") as string)
    : "overview";

  const { data: jobOrders = [], isLoading } = useJobOrders();
  const jobOrder = jobOrders.find((j) => j.id === jobOrderId);
  const { data: jobWorkflow } = useWorkflow(
    jobOrder?.workflowId,
    jobOrder?.workflowVersion,
  );
  const { data: workItems = [] } = useWorkItems(jobOrderId);
  const { data: partsRequests = [] } = usePartsRequests(jobOrderId);
  const { data: labor = [] } = useJobOrderLabor(jobOrderId);
  const { data: attachments = [] } = useJobOrderAttachments(jobOrderId);
  const moveJobStage = useMoveRecordStage("job-orders", jobOrderService);
  const requestApproval = useRequestApproval();

  const [pendingTransition, setPendingTransition] =
    useState<WorkflowTransition | null>(null);

  // Context the transition engine evaluates conditions against.
  const conditionContext: ConditionContext = {
    allWorkItemsCompleted: areAllWorkItemsComplete(workItems),
    partsReleased: arePartsReleasedForCycle(
      partsRequests,
      jobOrder?.partsCycle ?? 0,
    ),
    supervisorApproved: false,
    qaPassed: false,
  };

  const setTab = (value: string) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", value);
        if (value !== "work-items") next.delete("item");
        return next;
      },
      { replace: true },
    );

  // Activity feed for the Timeline tab: job order stage changes + work item updates.
  const timeline = useMemo(() => {
    const stageName = (sid: string) =>
      jobWorkflow?.stages.find((s) => s.id === sid)?.name ?? sid;
    const events = [
      ...(jobOrder?.history ?? []).map((h) => ({
        at: h.at,
        actor: h.actor,
        text: h.fromStageId
          ? `Job order moved to ${stageName(h.toStageId)}`
          : `Job order created in ${stageName(h.toStageId)}`,
      })),
      ...workItems.map((wi) => ({
        at: wi.updatedAt,
        actor: wi.assignee ?? "System",
        text: `${wi.code} ${wi.task} — ${getWorkItemStatus(wi.status).label}`,
      })),
    ];
    return events.sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [jobOrder, workItems, jobWorkflow]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!jobOrder) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Job order not found"
        description="This job order may have been removed or is not available to your account."
        action={
          <Button asChild variant="outline">
            <Link to={ROUTES.JOB_ORDERS}>
              <ArrowLeft className="h-4 w-4" /> Back to Job Orders
            </Link>
          </Button>
        }
      />
    );
  }

  const currentStage =
    jobWorkflow?.stages.find((s) => s.id === jobOrder.currentStageId) ?? null;
  const canMoveJob = can("job-orders:update");
  const stageName = (id: string) =>
    jobWorkflow?.stages.find((s) => s.id === id)?.name ?? id;
  const outgoing = getOutgoingTransitions(jobWorkflow, jobOrder.currentStageId);

  const handleMoveJob = async (
    toStageId: string,
    evidence?: WorkflowMoveEvidence,
  ): Promise<boolean> => {
    try {
      await moveJobStage.mutateAsync({
        id: jobOrder.id,
        toStageId,
        evidence,
      });
      toast.success(`Moved to ${stageName(toStageId)}`);
      return true;
    } catch (error) {
      toast.warning("Move blocked", {
        description:
          error instanceof Error ? error.message : "This move isn't allowed.",
      });
      return false;
    }
  };

  const startTransition = (transition: WorkflowTransition) => {
    const gated =
      (transition.conditions?.length ?? 0) > 0 ||
      (transition.approverRoles?.length ?? 0) > 0;
    if (gated) setPendingTransition(transition);
    else handleMoveJob(transition.toStageId);
  };

  const handleRequestApproval = async (
    toStageId: string,
    evidence: WorkflowMoveEvidence,
  ) => {
    if (!pendingTransition) return;
    try {
      const task = await requestApproval.mutateAsync({
        moduleId: "job-orders",
        recordId: jobOrder.id,
        toStageId,
        transitionId: pendingTransition.id,
        confirmedConditions: evidence.confirmedConditions,
      });
      toast.success("Approval requested", {
        description: `${task.requiredRoles.join(", ")} can review ${task.recordCode} in My Approvals.`,
      });
      setPendingTransition(null);
    } catch (error) {
      toast.error("Approval request failed", {
        description:
          error instanceof Error ? error.message : "This approval could not be requested.",
      });
    }
  };

  const laborTotal = labor.reduce((sum, l) => sum + l.hours * l.rate, 0);

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        onClick={() => navigate(ROUTES.JOB_ORDERS)}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Job Orders
      </Button>

      {/* Header */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClipboardList className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-xs text-muted-foreground">
                {jobOrder.code}
              </p>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {jobOrder.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <WorkflowStageBadge stage={currentStage} />
                <PriorityBadge priority={jobOrder.priority} />
                <Badge variant="secondary">{jobOrder.customer}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <ScrollableTabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="work-items">
            Work Items
            {workItems.length > 0 ? (
              <Badge variant="secondary" className="ml-1.5 px-1.5 py-0">
                {workItems.length}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="labor">Labor</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </ScrollableTabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Customer" value={jobOrder.customer} />
                <Detail label="Equipment" value={jobOrder.equipment} />
                <Detail
                  label="Service vehicle"
                  value={jobOrder.serviceVehicle ?? "Not assigned"}
                />
                <Detail
                  label="Priority"
                  value={<PriorityBadge priority={jobOrder.priority} />}
                />
                <Detail
                  label="Mechanics"
                  value={jobOrder.assignee ?? "Unassigned"}
                />
                <Detail label="Due date" value={formatDate(jobOrder.dueDate)} />
                <Detail label="Created" value={formatDate(jobOrder.createdAt)} />
              </div>
              {jobOrder.description ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Description
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {jobOrder.description}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow */}
        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle>Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {jobWorkflow ? (
                <>
                  <WorkflowTimeline
                    stages={jobWorkflow.stages}
                    currentStageId={jobOrder.currentStageId}
                  />
                  {!canMoveJob ? (
                    <p className="text-xs text-muted-foreground">
                      Read-only access.
                    </p>
                  ) : outgoing.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Available transitions
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {outgoing.map((t) => {
                          const gated =
                            (t.conditions?.length ?? 0) > 0 ||
                            (t.approverRoles?.length ?? 0) > 0;
                          return (
                            <Button
                              key={t.id}
                              variant="outline"
                              onClick={() => startTransition(t)}
                            >
                              {gated ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <ArrowRight className="h-4 w-4" />
                              )}
                              {t.label ?? stageName(t.toStageId)}
                            </Button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Transitions with a lock require conditions and/or
                        approvals set on the workflow.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No further transitions from this stage.
                    </p>
                  )}
                </>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work Items */}
        <TabsContent value="work-items">
          <JobOrderWorkItemsTab
            jobOrderId={jobOrder.id}
            jobOrderCode={jobOrder.code}
            mechanicIds={jobOrder.assigneeIds}
          />
        </TabsContent>

        {/* Parts */}
        <TabsContent value="parts">
          <JobOrderPartsTab
            jobOrderId={jobOrder.id}
            assigneeIds={jobOrder.assigneeIds}
          />
        </TabsContent>

        {/* Labor */}
        <TabsContent value="labor">
          <Card>
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Mechanic</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labor.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.mechanic}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(l.date)}
                    </TableCell>
                    <TableCell className="text-right">{l.hours}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(l.rate)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(l.hours * l.rate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>Labor total</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(laborTotal)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </Card>
        </TabsContent>

        {/* Attachments */}
        <TabsContent value="attachments">
          <Card>
            <CardContent className="divide-y p-0">
              {attachments.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Paperclip className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {a.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.type} · {a.size} · {a.uploadedBy} ·{" "}
                      {formatDate(a.uploadedAt)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    Sample file
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-0">
                {timeline.map((event, i) => (
                  <li
                    key={`${event.at}-${i}`}
                    className="relative flex gap-3 pb-4 last:pb-0"
                  >
                    {i < timeline.length - 1 ? (
                      <span className="absolute left-[7px] top-4 h-full w-px bg-border" />
                    ) : null}
                    <span className="z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-primary bg-background" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">{event.text}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.actor} · {formatRelativeTime(event.at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Workflow History</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowHistoryList
                history={jobOrder.history}
                stages={jobWorkflow?.stages ?? []}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TransitionDialog
        open={Boolean(pendingTransition)}
        onOpenChange={(o) => !o && setPendingTransition(null)}
        transition={pendingTransition}
        toStageName={
          pendingTransition ? stageName(pendingTransition.toStageId) : ""
        }
        context={conditionContext}
        confirming={moveJobStage.isPending}
        requestingApproval={requestApproval.isPending}
        onConfirm={async (toStageId, evidence) => {
          if (await handleMoveJob(toStageId, evidence)) {
            setPendingTransition(null);
          }
        }}
        onRequestApproval={handleRequestApproval}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
