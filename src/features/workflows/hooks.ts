import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import {
  workflowService,
  type WorkflowUpdateInput,
} from "@/services/workflow.service";

export function useWorkflows() {
  return useQuery({
    queryKey: queryKeys.workflows.list,
    queryFn: () => workflowService.list(),
  });
}

export function useWorkflow(id?: number, version?: number) {
  return useQuery({
    queryKey: queryKeys.workflows.detail(id ?? -1, version),
    queryFn: () => workflowService.get(id as number, version),
    enabled: id !== undefined && !Number.isNaN(id),
  });
}

/** Resolve the active workflow for a module — used by the Service modules. */
export function useWorkflowByModule(moduleId: string) {
  return useQuery({
    queryKey: queryKeys.workflows.byModule(moduleId),
    queryFn: () => workflowService.getByModule(moduleId),
  });
}

export function useUpdateWorkflow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: WorkflowUpdateInput }) =>
      workflowService.update(id, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.workflows.all }),
  });
}

/** All immutable revisions for rendering records pinned to older workflows. */
export function useWorkflowVersionsByModule(moduleId: string) {
  return useQuery({
    queryKey: queryKeys.workflows.versionsByModule(moduleId),
    queryFn: () => workflowService.listVersionsByModule(moduleId),
  });
}
