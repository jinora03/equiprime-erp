import {
  ArrowRight,
  ClipboardList,
  Clock3,
  ListChecks,
  PlayCircle,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { jobOrderDetailPath } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-context";
import { useUpdateWorkItemStatus } from "@/features/work-items/hooks";
import { WorkItemStatusActionButton } from "@/features/work-items/components/work-item-status-action-button";
import { WorkItemStatusChip } from "@/features/work-items/components/work-item-status-chip";
import {
  useWorkflowByModule,
  useWorkflowVersionsByModule,
} from "@/features/workflows/hooks";
import { usePermissions } from "@/hooks/use-permissions";
import { EmptyState } from "@/shared/components/empty-state";
import { PageHeader } from "@/shared/components/page-header";
import { PriorityBadge } from "@/shared/components/priority-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowStageBadge } from "@/shared/components/workflow-stage-badge";
import { formatDate } from "@/utils/format";
import { useMyWork } from "../hooks";

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
            ? `Work currently assigned to ${user.full_name} in the active branch.`
            : "Work currently assigned to you in the active branch."
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
            label="Assigned Job Orders"
            value={jobOrders.length}
          />
          <SummaryCard
            icon={Clock3}
            label="Not Started"
            value={notStarted}
          />
          <SummaryCard
            icon={PlayCircle}
            label="In Progress"
            value={inProgress}
          />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assigned Job Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-44 w-full rounded-lg" />
            ) : jobOrders.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No active job orders"
                description="There are no active job orders assigned to you in this branch."
              />
            ) : (
              <div className="divide-y">
                {jobOrders.map((jobOrder) => (
                  <Link
                    key={jobOrder.id}
                    to={jobOrderDetailPath(jobOrder.id)}
                    className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-muted-foreground">
                        {jobOrder.code}
                      </p>
                      <p className="truncate text-sm font-medium text-foreground">
                        {jobOrder.title}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <WorkflowStageBadge stage={stageOf(jobOrder)} />
                        <PriorityBadge priority={jobOrder.priority} />
                        <span className="text-xs text-muted-foreground">
                          Due {formatDate(jobOrder.dueDate)}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Work Items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-44 w-full rounded-lg" />
            ) : workItems.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="No active work items"
                description="There are no incomplete work items assigned to you."
              />
            ) : (
              <div className="divide-y">
                {workItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {item.code}
                        </span>
                        <WorkItemStatusChip status={item.status} />
                      </div>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {item.task}
                      </p>
                      <Button
                        asChild
                        variant="link"
                        size="sm"
                        className="mt-1 h-auto p-0 text-xs"
                      >
                        <Link
                          to={`${jobOrderDetailPath(item.jobOrderId)}?tab=work-items`}
                        >
                          {item.jobOrderCode}
                        </Link>
                      </Button>
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
                ))}
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
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-2xl font-semibold tabular-nums text-foreground">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
