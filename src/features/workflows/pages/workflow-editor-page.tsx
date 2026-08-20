import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Layers, RotateCcw, Save, Workflow as WorkflowIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { PageHeader } from "@/shared/components/page-header";
import { EmptyState } from "@/shared/components/empty-state";
import type { WorkflowStage, WorkflowStatus } from "@/types";
import { useUpdateWorkflow, useWorkflow } from "../hooks";
import { StageListEditor } from "../components/stage-list-editor";

interface Draft {
  name: string;
  description: string;
  status: WorkflowStatus;
  stages: WorkflowStage[];
}

export function WorkflowEditorPage() {
  const { id } = useParams<{ id: string }>();
  const workflowId = Number(id);
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { user } = useAuth();
  const editable = can("workflows:manage");

  const { data: workflow, isLoading, isError } = useWorkflow(workflowId);
  const updateWorkflow = useUpdateWorkflow();

  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    if (workflow) {
      setDraft({
        name: workflow.name,
        description: workflow.description ?? "",
        status: workflow.status,
        stages: workflow.stages,
      });
    }
    // Re-init only when a different workflow loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow?.id]);

  const dirty = useMemo(() => {
    if (!workflow || !draft) return false;
    return (
      draft.name !== workflow.name ||
      draft.description !== (workflow.description ?? "") ||
      draft.status !== workflow.status ||
      JSON.stringify(draft.stages.map((s) => [s.id, s.name, s.tone])) !==
        JSON.stringify(workflow.stages.map((s) => [s.id, s.name, s.tone]))
    );
  }, [draft, workflow]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !workflow || !draft) {
    return (
      <EmptyState
        icon={WorkflowIcon}
        title="Workflow not found"
        description="This workflow may have been removed."
        action={
          <Button asChild variant="outline">
            <Link to={ROUTES.WORKFLOWS}>
              <ArrowLeft className="h-4 w-4" /> Back to Workflows
            </Link>
          </Button>
        }
      />
    );
  }

  const handleSave = async () => {
    try {
      await updateWorkflow.mutateAsync({
        id: workflow.id,
        input: {
          name: draft.name,
          description: draft.description,
          status: draft.status,
          stages: draft.stages,
          actor: user?.full_name ?? "System",
        },
      });
      toast.success("Workflow saved", {
        description: `${draft.name} was updated.`,
      });
    } catch {
      toast.error("Couldn't save workflow.");
    }
  };

  const reset = () =>
    setDraft({
      name: workflow.name,
      description: workflow.description ?? "",
      status: workflow.status,
      stages: workflow.stages,
    });

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        onClick={() => navigate(ROUTES.WORKFLOWS)}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Workflows
      </Button>

      <PageHeader
        title={workflow.name}
        description={`Configure the ${workflow.moduleLabel} workflow.`}
        actions={
          editable ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={reset} disabled={!dirty}>
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={!dirty || updateWorkflow.isPending}
              >
                <Save className="h-4 w-4" />
                {updateWorkflow.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Workflow details</CardTitle>
            <CardDescription>Naming and status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Workflow name</Label>
              <Input
                value={draft.name}
                disabled={!editable}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={draft.description}
                disabled={!editable}
                rows={3}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Target module</Label>
              <div className="flex h-9 items-center rounded-md border border-input bg-muted/40 px-3">
                <Badge variant="secondary">{workflow.moduleLabel}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                One active workflow per module in this phase.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={draft.status}
                onValueChange={(v) =>
                  setDraft({ ...draft, status: v as WorkflowStatus })
                }
                disabled={!editable}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Stages</CardTitle>
            </div>
            <CardDescription>
              {editable
                ? "Drag to reorder, rename inline, recolor, add, or remove stages. Changes apply to new and existing records."
                : "Read-only — you need the Manage permission to edit."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StageListEditor
              stages={draft.stages}
              editable={editable}
              onChange={(stages) => setDraft({ ...draft, stages })}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
