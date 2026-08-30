import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  ListChecks,
  PlayCircle,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { jobOrderDetailPath } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-context";
import { WorkItemStatusActionButton } from "@/features/work-items/components/work-item-status-action-button";
import { WorkItemStatusChip } from "@/features/work-items/components/work-item-status-chip";
import { useUpdateWorkItemStatus } from "@/features/work-items/hooks";
import {
  useWorkflowByModule,
  useWorkflowVersionsByModule,
} from "@/features/workflows/hooks";
import { usePermissions } from "@/hooks/use-permissions";
import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";
import { PriorityBadge } from "@/shared/components/priority-badge";
import { WorkflowStageBadge } from "@/shared/components/workflow-stage-badge";
import { formatDate } from "@/utils/format";
import { useMyWork } from "../hooks";

const WAITING_PARTS_STAGE = "jo-waiting-parts";

export function MyWorkPage() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const { data, isLoading } = useMyWork();
  const { data: workflow } = useWorkflowByModule("job-orders");
  const { data: workflowVersions = [] } =
    useWorkflowVersionsByModule("job-orders");
  const updateStatus = useUpdateWorkItemStatus();

  const jobOrders = data?.jobOrders ?? [];
  const workItems = data?.workItems ?? [];
  const notStarted = workItems.filter(
    (item) => item.status === "not_started",
  ).length;
  const inProgress = workItems.filter(
    (item) => item.status === "in_progress",
  ).length;
  const blockedJobs = jobOrders.filter(
    (jobOrder) => jobOrder.currentStageId === WAITING_PARTS_STAGE,
  ).length;

  const jobOrderById = new Map(jobOrders.map((jobOrder) => [jobOrder.id, jobOrder]));
  const orderedWorkItems = [...workItems].sort((a, b) => {
    const statusRank = { in_progress: 0, not_started: 1, completed: 2 } as const;
    const rank = statusRank[a.status] - statusRank[b.status];
    if (rank !== 0) return rank;
    return (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31");
  });

  const stageOf = (jobOrder: (typeof jobOrders)[number]) => {
    const recordWorkflow =
      workflowVersions.find(
        (candidate) =>
          candidate.id === jobOrder.workflowId &&
          candidate.version === jobOrder.workflowVersion,
      ) ?? workflow;
    return (
      recordWorkflow?.stages.find(
        (stage) => stage.id === jobOrder.currentStageId,
      ) ?? null
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Work"
        description={
          user
            ? `Your active tasks and assigned jobs in this branch, ${user.first_name}.`
            : "Your active tasks and assigned jobs in this branch."
        }
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard
            icon={ClipboardList}
            label="My Job Orders"
            value={jobOrders.length}
            detail="Assigned to you"
          />
          <SummaryCard
            icon={PlayCircle}
            label="Active Work Items"
            value={workItems.length}
            detail={`${inProgress} in progress · ${notStarted} not started`}
          />
          <SummaryCard
            icon={AlertCircle}
            label="Blocked Jobs"
            value={blockedJobs}
            detail={blockedJobs > 0 ? "Waiting for parts" : "Nothing blocked"}
            attention={blockedJobs > 0}
          />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base">Work Items Requiring Action</CardTitle>
            <CardDescription>
              Work items are your primary actions. Open the job order when you need context.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full rounded-lg" />
            ) : orderedWorkItems.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="No active work items"
                description="There are no incomplete work items assigned to you."
              />
            ) : (
              <div className="space-y-2.5">
                {orderedWorkItems.map((item) => {
                  const jobOrder = jobOrderById.get(item.jobOrderId);
                  const blocked = jobOrder?.currentStageId === WAITING_PARTS_STAGE;

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/20"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">
                              {item.code}
                            </span>
                            <WorkItemStatusChip status={item.status} />
                            {blocked ? (
                              <Badge variant="warning">Blocked by parts</Badge>
                            ) : null}
                          </div>
                          <p className="mt-1.5 text-sm font-semibold text-foreground">
                            {item.task}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <Button
                              asChild
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                            >
                              <Link
                                to={`${jobOrderDetailPath(item.jobOrderId)}?tab=work-items`}
                              >
                                {item.jobOrderCode}
                                {jobOrder ? ` · ${jobOrder.title}` : ""}
                              </Link>
                            </Button>
                            {jobOrder?.equipment ? (
                              <span>{jobOrder.equipment}</span>
                            ) : null}
                            {item.dueDate ? (
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5" />
                                Due {formatDate(item.dueDate)}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {can("work-items:update") ? (
                          <WorkItemStatusActionButton
                            status={item.status}
                            disabled={
                              updateStatus.isPending &&
                              updateStatus.variables?.id === item.id
                            }
                            onChange={(status) =>
                              updateStatus.mutate({ id: item.id, status })
                            }
                          />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base">Assigned Job Orders</CardTitle>
            <CardDescription>
              Read-only job context for the work assigned to you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full rounded-lg" />
            ) : jobOrders.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No active job orders"
                description="There are no active job orders assigned to you in this branch."
              />
            ) : (
              <div className="divide-y">
                {jobOrders.map((jobOrder) => {
                  const myOpenItems = workItems.filter(
                    (item) =>
                      item.jobOrderId === jobOrder.id && item.status !== "completed",
                  ).length;
                  return (
                    <Link
                      key={jobOrder.id}
                      to={jobOrderDetailPath(jobOrder.id)}
                      className="group flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-muted-foreground">
                          {jobOrder.code}
                        </p>
                        <p className="truncate text-sm font-semibold text-foreground">
                          {jobOrder.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {jobOrder.equipment}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <WorkflowStageBadge stage={stageOf(jobOrder)} />
                          <PriorityBadge priority={jobOrder.priority} />
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>Due {formatDate(jobOrder.dueDate)}</span>
                          <span>
                            {myOpenItems} {myOpenItems === 1 ? "open item" : "open items"}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
  attention = false,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  detail: string;
  attention?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span
          className={
            attention
              ? "flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning"
              : "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
          }
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {value}
            </p>
            <p className="truncate text-xs text-muted-foreground">{detail}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
