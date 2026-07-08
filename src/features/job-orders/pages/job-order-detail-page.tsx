import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  FileText,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useMoveRecordStage, useRecords } from "@/hooks/use-workflow-records";
import { EmptyState } from "@/shared/components/empty-state";
import { PriorityBadge } from "@/shared/components/priority-badge";
import { WorkflowHistoryList } from "@/shared/components/workflow-history-list";
import { WorkflowStageBadge } from "@/shared/components/workflow-stage-badge";
import { WorkflowTimeline } from "@/shared/components/workflow-timeline";
import { formatCurrency, formatDate, formatRelativeTime } from "@/utils/format";
import { useWorkflowByModule } from "@/features/workflows/hooks";
import { useWorkItems } from "@/features/work-items/hooks";
import { getWorkItemStatus } from "@/features/work-items/statuses";
import { usePartsRequests } from "@/features/parts/hooks";
import {
  getOutgoingTransitions,
  type ConditionContext,
} from "@/features/workflows/transition-engine";
import { TransitionDialog } from "@/features/workflows/components/transition-dialog";
import type { WorkflowTransition } from "@/types";
import { jobOrderService } from "../service";
import { SAMPLE_ATTACHMENTS, SAMPLE_LABOR } from "../detail-data";
import { JobOrderWorkItemsTab } from "../components/job-order-work-items-tab";
import { JobOrderPartsTab } from "../components/job-order-parts-tab";

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
  const { user } = useAuth();
  const { can } = usePermissions();

  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.includes(searchParams.get("tab") ?? "")
    ? (searchParams.get("tab") as string)
    : "overview";

  const { data: jobOrders = [], isLoading } = useRecords(
    "job-orders",
    jobOrderService,
  );
  const { data: jobWorkflow } = useWorkflowByModule("job-orders");
  const { data: workItems = [] } = useWorkItems(jobOrderId);
  const { data: partsRequests = [] } = usePartsRequests(jobOrderId);
  const moveJobStage = useMoveRecordStage("job-orders", jobOrderService);

  const [pendingTransition, setPendingTransition] =
    useState<WorkflowTransition | null>(null);

  const jobOrder = jobOrders.find((j) => j.id === jobOrderId);

  // Context the transition engine evaluates conditions against.
  const conditionContext: ConditionContext = {
    allWorkItemsCompleted: workItems.every((w) => w.status === "completed"),
    partsReleased: partsRequests.some((r) => r.status === "released"),
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
        description="This job order may have been removed."
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

  const handleMoveJob = async (toStageId: string) => {
    try {
      await moveJobStage.mutateAsync({
        id: jobOrder.id,
        toStageId,
        actor: user?.full_name ?? "System",
      });
      toast.success(`Moved to ${stageName(toStageId)}`);
    } catch {
      toast.error("Couldn't update stage.");
    }
  };

  const startTransition = (transition: WorkflowTransition) => {
    const gated =
      (transition.conditions?.length ?? 0) > 0 ||
      (transition.approverRoles?.length ?? 0) > 0;
    if (gated) setPendingTransition(transition);
    else handleMoveJob(transition.toStageId);
  };

  const laborTotal = SAMPLE_LABOR.reduce((sum, l) => sum + l.hours * l.rate, 0);

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
        <TabsList className="flex h-auto flex-wrap justify-start gap-1">
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
        </TabsList>

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
                  label="Priority"
                  value={<PriorityBadge priority={jobOrder.priority} />}
                />
                <Detail
                  label="Assignee"
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
                              {stageName(t.toStageId)}
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
          />
        </TabsContent>

        {/* Parts */}
        <TabsContent value="parts">
          <JobOrderPartsTab jobOrderId={jobOrder.id} />
        </TabsContent>

        {/* Labor */}
        <TabsContent value="labor">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SAMPLE_LABOR.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.technician}</TableCell>
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
              {SAMPLE_ATTACHMENTS.map((a) => (
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
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4" /> View
                  </Button>
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
        onConfirm={(toStageId) => {
          handleMoveJob(toStageId);
          setPendingTransition(null);
        }}
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
