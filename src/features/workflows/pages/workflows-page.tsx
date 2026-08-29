import { useNavigate } from "react-router-dom";
import { Info, Settings2, Workflow as WorkflowIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { workflowEditorPath } from "@/constants/routes";
import { usePermissions } from "@/hooks/use-permissions";
import { PageHeader } from "@/shared/components/page-header";
import { TableSkeleton } from "@/shared/components/table-skeleton";
import { formatDate } from "@/utils/format";
import type { WorkflowStatus } from "@/types";
import { useWorkflows } from "../hooks";

const STATUS_VARIANT: Record<
  WorkflowStatus,
  "success" | "warning" | "secondary"
> = {
  active: "success",
  draft: "warning",
  archived: "secondary",
};

export function WorkflowsPage() {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { data: workflows = [], isLoading } = useWorkflows();
  const canManage = can("workflows:manage");

  return (
    <div className="space-y-4">
      <PageHeader
        title="Workflows"
        description="Configure the business processes that power your Service modules."
      />

      {/* Philosophy hint */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-muted-foreground">
          Administrators configure workflows here; users simply execute business
          processes. Each Service module follows its assigned workflow
          automatically — users never edit workflows.
        </p>
      </div>

      <Card>
        {isLoading ? (
          <TableSkeleton columns={6} />
        ) : (
          <Table className="min-w-[780px]">
            <TableHeader>
              <TableRow>
                <TableHead>Workflow Name</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated By</TableHead>
                <TableHead>Updated Date</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((workflow) => (
                <TableRow
                  key={workflow.id}
                  className="cursor-pointer"
                  onClick={() => navigate(workflowEditorPath(workflow.id))}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <WorkflowIcon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {workflow.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {workflow.stages.length} stages · v{workflow.version}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{workflow.moduleLabel}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={STATUS_VARIANT[workflow.status]}
                      className="capitalize"
                    >
                      {workflow.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {workflow.updatedBy}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(workflow.updatedAt)}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(workflowEditorPath(workflow.id))}
                    >
                      <Settings2 className="h-4 w-4" />
                      {canManage ? "Configure" : "View"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
