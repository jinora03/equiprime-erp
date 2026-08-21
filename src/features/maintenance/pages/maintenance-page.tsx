import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Wrench } from "lucide-react";
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
import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useMoveRecordStage, useRecords } from "@/hooks/use-workflow-records";
import { PageHeader } from "@/shared/components/page-header";
import { PermissionGuard } from "@/components/permission-guard";
import { EmptyState } from "@/shared/components/empty-state";
import { PriorityBadge } from "@/shared/components/priority-badge";
import { TableSkeleton } from "@/shared/components/table-skeleton";
import { WorkflowDetailSheet } from "@/shared/components/workflow-detail-sheet";
import { WorkflowStageBadge } from "@/shared/components/workflow-stage-badge";
import { formatDate } from "@/utils/format";
import { useWorkflowByModule } from "@/features/workflows/hooks";
import type { Maintenance } from "../types";
import { maintenanceService } from "../service";
import { MaintenanceFormDialog } from "../components/maintenance-form-dialog";

export function MaintenancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { can, permissions } = usePermissions();
  const canMove = can("maintenance:update");
  const canCreate = can("maintenance:create");

  const { data: records = [], isLoading } = useRecords(
    "maintenance",
    maintenanceService,
  );
  const { data: workflow } = useWorkflowByModule("maintenance");
  const moveStage = useMoveRecordStage("maintenance", maintenanceService);

  const [selected, setSelected] = useState<Maintenance | null>(null);
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

  const handleMove = async (toStageId: string) => {
    if (!selected) return;
    try {
      const updated = await moveStage.mutateAsync({
        id: selected.id,
        toStageId,
        actor: user?.full_name ?? "System",
        actorRole: user?.role,
        permissions,
      });
      setSelected(updated as Maintenance);
      toast.success("Stage updated");
    } catch (error) {
      toast.warning("Move blocked", {
        description:
          error instanceof Error ? error.message : "This move isn't allowed.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Maintenance"
        description="Preventive maintenance schedule — each follows the Maintenance Workflow."
        actions={
          <PermissionGuard permission="maintenance:create">
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" /> Schedule maintenance
            </Button>
          </PermissionGuard>
        }
      />

      <Card>
        {isLoading ? (
          <TableSkeleton columns={5} />
        ) : records.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="Nothing scheduled"
            description="Schedule maintenance to track it through the workflow."
            className="m-4"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Scheduled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow
                  key={record.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(record)}
                >
                  <TableCell>
                    <p className="font-mono text-xs text-muted-foreground">
                      {record.code}
                    </p>
                    <p className="font-medium text-foreground">{record.type}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {record.equipment}
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={record.priority} />
                  </TableCell>
                  <TableCell>
                    <WorkflowStageBadge stage={stageOf(record.currentStageId)} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(record.scheduledDate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <MaintenanceFormDialog open={createOpen} onOpenChange={setCreateDialogOpen} />

      <WorkflowDetailSheet
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        icon={Wrench}
        code={selected?.code ?? ""}
        title={selected?.title ?? ""}
        workflow={workflow}
        currentStageId={selected?.currentStageId ?? ""}
        history={selected?.history ?? []}
        canMove={canMove}
        moving={moveStage.isPending}
        onMoveStage={handleMove}
        meta={
          selected
            ? [
                { label: "Equipment", value: selected.equipment },
                { label: "Service type", value: selected.type },
                {
                  label: "Priority",
                  value: <PriorityBadge priority={selected.priority} />,
                },
                { label: "Assignee", value: selected.assignee ?? "Unassigned" },
                {
                  label: "Scheduled",
                  value: formatDate(selected.scheduledDate),
                },
                { label: "Created", value: formatDate(selected.createdAt) },
              ]
            : []
        }
      />
    </div>
  );
}
