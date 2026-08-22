import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ClipboardList, KanbanSquare, Plus, Rows3 } from "lucide-react";
import { toast } from "sonner";

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
import { jobOrderDetailPath } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useMoveRecordStage } from "@/hooks/use-workflow-records";
import { PageHeader } from "@/shared/components/page-header";
import { PermissionGuard } from "@/components/permission-guard";
import { EmptyState } from "@/shared/components/empty-state";
import { PriorityBadge } from "@/shared/components/priority-badge";
import { TableSkeleton } from "@/shared/components/table-skeleton";
import { WorkflowKanban } from "@/shared/components/workflow-kanban";
import { WorkflowStageBadge } from "@/shared/components/workflow-stage-badge";
import { formatDate } from "@/utils/format";
import { useWorkflowByModule } from "@/features/workflows/hooks";
import { isAssignedOnlyServiceActor } from "@/services/service-work-access";
import type { JobOrder } from "../types";
import { useJobOrders } from "../hooks";
import { jobOrderService } from "../service";
import { JobOrderFormDialog } from "../components/job-order-form-dialog";
import { JobOrderKanbanCard } from "../components/job-order-kanban-card";

export function JobOrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { can, permissions } = usePermissions();
  const canMove = can("job-orders:update");
  const canCreate = can("job-orders:create");

  const { data: jobOrders = [], isLoading } = useJobOrders();
  const { data: workflow } = useWorkflowByModule("job-orders");
  const moveStage = useMoveRecordStage("job-orders", jobOrderService);
  const assignedOnly =
    user != null &&
    isAssignedOnlyServiceActor({
      userId: user.id,
      role: user.role,
      permissions,
    });

  const [view, setView] = useState<"list" | "kanban">("list");
  const createRequested = searchParams.get("create") === "1";
  const [createOpen, setCreateOpen] = useState(createRequested && canCreate);

  useEffect(() => {
    if (createRequested && canCreate) setCreateOpen(true);
  }, [canCreate, createRequested]);

  const setCreateDialogOpen = (open: boolean) => {
    setCreateOpen(open);
    if (!open && createRequested) {
      const next = new URLSearchParams(searchParams);
      next.delete("create");
      setSearchParams(next, { replace: true });
    }
  };

  const stageOf = (id: string) =>
    workflow?.stages.find((s) => s.id === id) ?? null;

  const open = (jo: JobOrder) => navigate(jobOrderDetailPath(jo.id));

  const handleMove = async (id: number, toStageId: string) => {
    try {
      await moveStage.mutateAsync({
        id,
        toStageId,
        actor: user?.full_name ?? "System",
        actorId: user?.id,
        actorRole: user?.role,
        permissions,
      });
      toast.success(`Moved to ${stageOf(toStageId)?.name ?? "new stage"}`);
    } catch (error) {
      toast.warning("Move blocked", {
        description:
          error instanceof Error ? error.message : "This move isn't allowed.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div data-onboarding="job-orders">
        <PageHeader
          title="Job Orders"
          description="Service and repair jobs — the primary record for all field work."
          actions={
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
                <Button
                  variant={view === "list" ? "selection" : "ghost"}
                  size="sm"
                  className="h-8"
                  onClick={() => setView("list")}
                >
                  <Rows3 className="h-4 w-4" /> List
                </Button>
                <Button
                  variant={view === "kanban" ? "selection" : "ghost"}
                  size="sm"
                  className="h-8"
                  onClick={() => setView("kanban")}
                >
                  <KanbanSquare className="h-4 w-4" /> Kanban
                </Button>
              </div>
              <PermissionGuard permission="job-orders:create">
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4" /> New job order
                </Button>
              </PermissionGuard>
            </div>
          }
        />
      </div>

      {isLoading ? (
        <Card>
          <TableSkeleton columns={6} />
        </Card>
      ) : jobOrders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={assignedOnly ? "No assigned job orders" : "No job orders yet"}
          description={
            assignedOnly
              ? "There are no job orders assigned to you in this branch."
              : "Create a job order to start tracking it through the workflow."
          }
        />
      ) : view === "list" ? (
        <Card>
          <Table className="min-w-[780px]">
            <TableHeader>
              <TableRow>
                <TableHead>Job Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobOrders.map((jo) => (
                <TableRow
                  key={jo.id}
                  className="cursor-pointer"
                  onClick={() => open(jo)}
                >
                  <TableCell>
                    <p className="font-mono text-xs text-muted-foreground">
                      {jo.code}
                    </p>
                    <p className="font-medium text-foreground">{jo.title}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {jo.customer}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <p>{jo.equipment}</p>
                    {jo.serviceVehicle ? (
                      <p className="mt-0.5 text-xs text-muted-foreground/80">
                        {jo.serviceVehicle}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={jo.priority} />
                  </TableCell>
                  <TableCell>
                    <WorkflowStageBadge stage={stageOf(jo.currentStageId)} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(jo.dueDate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : workflow ? (
        <WorkflowKanban
          items={jobOrders}
          workflow={workflow}
          canMove={canMove}
          fillAvailableHeight
          onMove={handleMove}
          renderCard={(jo) => (
            <JobOrderKanbanCard jobOrder={jo} onClick={() => open(jo)} />
          )}
        />
      ) : null}

      <JobOrderFormDialog open={createOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
