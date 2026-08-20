import { useState } from "react";
import { FolderKanban, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { TableSkeleton } from "@/shared/components/table-skeleton";
import { WorkflowDetailSheet } from "@/shared/components/workflow-detail-sheet";
import { WorkflowStageBadge } from "@/shared/components/workflow-stage-badge";
import { formatDate } from "@/utils/format";
import { useWorkflowByModule } from "@/features/workflows/hooks";
import type { Project } from "../types";
import { projectService } from "../service";
import { ProjectFormDialog } from "../components/project-form-dialog";

export function ProjectsPage() {
  const { user } = useAuth();
  const { can, permissions } = usePermissions();
  const canMove = can("projects:update");

  const { data: projects = [], isLoading } = useRecords(
    "projects",
    projectService,
  );
  const { data: workflow } = useWorkflowByModule("projects");
  const moveStage = useMoveRecordStage("projects", projectService);

  const [selected, setSelected] = useState<Project | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

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
      setSelected(updated as Project);
      toast.success("Stage updated");
    } catch (error) {
      toast.warning("Move blocked", {
        description:
          error instanceof Error ? error.message : "This move isn't allowed.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Service and installation projects — each follows the Project Workflow."
        actions={
          <PermissionGuard permission="projects:create">
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New project
            </Button>
          </PermissionGuard>
        }
      />

      <Card>
        {isLoading ? (
          <TableSkeleton columns={5} />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create a project to track it through the workflow."
            className="m-4"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="w-[160px]">Progress</TableHead>
                <TableHead>Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(project)}
                >
                  <TableCell>
                    <p className="font-mono text-xs text-muted-foreground">
                      {project.code}
                    </p>
                    <p className="font-medium text-foreground">
                      {project.title}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {project.client}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {project.manager}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={project.progress} className="h-2" />
                      <span className="w-9 text-right text-xs text-muted-foreground">
                        {project.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <WorkflowStageBadge
                      stage={stageOf(project.currentStageId)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <ProjectFormDialog open={createOpen} onOpenChange={setCreateOpen} />

      <WorkflowDetailSheet
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        icon={FolderKanban}
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
                { label: "Client", value: selected.client },
                { label: "Manager", value: selected.manager },
                { label: "Progress", value: `${selected.progress}%` },
                { label: "Start date", value: formatDate(selected.startDate) },
                { label: "Due date", value: formatDate(selected.dueDate) },
                { label: "Created", value: formatDate(selected.createdAt) },
              ]
            : []
        }
      />
    </div>
  );
}
