import { useState } from "react";
import {
  Check,
  KanbanSquare,
  ListChecks,
  Play,
  Plus,
  RotateCcw,
  Rows3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePermissions } from "@/hooks/use-permissions";
import { PermissionGuard } from "@/components/permission-guard";
import { EmptyState } from "@/shared/components/empty-state";
import { PriorityBadge } from "@/shared/components/priority-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/format";
import {
  useUpdateWorkItemStatus,
  useWorkItems,
} from "@/features/work-items/hooks";
import {
  getWorkItemStatusAction,
  isWorkItemComplete,
  type WorkItemStatus,
} from "@/features/work-items/statuses";
import { WorkItemStatusChip } from "@/features/work-items/components/work-item-status-chip";
import { WorkItemFormDialog } from "@/features/work-items/components/work-item-form-dialog";
import { WorkItemKanban } from "@/features/work-items/components/work-item-kanban";

interface JobOrderWorkItemsTabProps {
  jobOrderId: number;
  jobOrderCode: string;
  mechanicIds: number[];
}

export function JobOrderWorkItemsTab({
  jobOrderId,
  jobOrderCode,
  mechanicIds,
}: JobOrderWorkItemsTabProps) {
  const { can } = usePermissions();
  const canEdit = can("work-items:update");

  const { data: items = [], isLoading } = useWorkItems(jobOrderId);
  const updateStatus = useUpdateWorkItemStatus();
  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState<"table" | "kanban">("table");
  const completedCount = items.filter((item) =>
    isWorkItemComplete(item.status),
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
          <Button
            variant={view === "table" ? "default" : "ghost"}
            size="sm"
            className="h-8"
            onClick={() => setView("table")}
          >
            <Rows3 className="h-4 w-4" /> Table
          </Button>
          <Button
            variant={view === "kanban" ? "default" : "ghost"}
            size="sm"
            className="h-8"
            onClick={() => setView("kanban")}
          >
            <KanbanSquare className="h-4 w-4" /> Kanban
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {items.length > 0 ? (
            <span className="hidden whitespace-nowrap text-sm text-muted-foreground sm:inline">
              {completedCount} of {items.length} complete
            </span>
          ) : null}
          <PermissionGuard permission="work-items:create">
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Add work item
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No work items yet"
          description="Break this job order down into work items to track progress."
          action={
            <PermissionGuard permission="work-items:create">
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" /> Add work item
              </Button>
            </PermissionGuard>
          }
        />
      ) : view === "kanban" ? (
        <WorkItemKanban
          items={items}
          canMove={canEdit}
          onMove={(id, status) => updateStatus.mutate({ id, status })}
        />
      ) : (
        <Card>
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Mechanic</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="min-w-[96px] text-right">Hours</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="min-w-[190px]">Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-mono text-xs text-muted-foreground">
                      {item.code}
                    </p>
                    <p className="font-medium text-foreground">{item.task}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.assignee ?? "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={item.priority} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto grid w-fit grid-cols-[auto_auto] gap-x-2 text-xs tabular-nums">
                      <span className="text-muted-foreground">Est.</span>
                      <span className="font-medium text-foreground">
                        {item.estimatedHours}h
                      </span>
                      <span className="text-muted-foreground">Act.</span>
                      <span className="font-medium text-foreground">
                        {item.actualHours}h
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.dueDate ? formatDate(item.dueDate) : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <WorkItemStatusChip status={item.status} />
                      {canEdit ? (
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
                  </TableCell>
                  <TableCell
                    className="max-w-[220px] truncate text-sm text-muted-foreground"
                    title={item.notes ?? ""}
                  >
                    {item.notes || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <WorkItemFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        jobOrderId={jobOrderId}
        jobOrderCode={jobOrderCode}
        mechanicIds={mechanicIds}
      />
    </div>
  );
}

function WorkItemStatusActionButton({
  status,
  disabled,
  onChange,
}: {
  status: WorkItemStatus;
  disabled: boolean;
  onChange: (status: WorkItemStatus) => void;
}) {
  const action = getWorkItemStatusAction(status);
  const Icon =
    action.label === "Start"
      ? Play
      : action.label === "Complete"
        ? Check
        : RotateCcw;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 gap-1.5 px-2 text-xs"
      disabled={disabled}
      onClick={() => onChange(action.nextStatus)}
      aria-label={`${action.label} work item`}
    >
      <Icon className="h-3.5 w-3.5" />
      {action.label}
    </Button>
  );
}
