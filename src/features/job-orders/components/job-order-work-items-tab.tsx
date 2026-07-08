import { useState } from "react";
import { KanbanSquare, ListChecks, Plus, Rows3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { WORK_ITEM_STATUSES, type WorkItemStatus } from "@/features/work-items/statuses";
import { WorkItemStatusChip } from "@/features/work-items/components/work-item-status-chip";
import { WorkItemFormDialog } from "@/features/work-items/components/work-item-form-dialog";
import { WorkItemKanban } from "@/features/work-items/components/work-item-kanban";

interface JobOrderWorkItemsTabProps {
  jobOrderId: number;
  jobOrderCode: string;
}

export function JobOrderWorkItemsTab({
  jobOrderId,
  jobOrderCode,
}: JobOrderWorkItemsTabProps) {
  const { can } = usePermissions();
  const canEdit = can("work-items:update");

  const { data: items = [], isLoading } = useWorkItems(jobOrderId);
  const updateStatus = useUpdateWorkItemStatus();
  const [createOpen, setCreateOpen] = useState(false);
  const [view, setView] = useState<"table" | "kanban">("table");

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
        <PermissionGuard permission="work-items:create">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Add work item
          </Button>
        </PermissionGuard>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Est / Act</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="w-[160px]">Status</TableHead>
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
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {item.estimatedHours}h / {item.actualHours}h
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.dueDate ? formatDate(item.dueDate) : "—"}
                  </TableCell>
                  <TableCell>
                    {canEdit ? (
                      <Select
                        value={item.status}
                        onValueChange={(v) =>
                          updateStatus.mutate({
                            id: item.id,
                            status: v as WorkItemStatus,
                          })
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WORK_ITEM_STATUSES.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <WorkItemStatusChip status={item.status} />
                    )}
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
      />
    </div>
  );
}
