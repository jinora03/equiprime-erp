import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import {
  organizationScopeKey,
  useOrganizationScope,
} from "@/store/organization.store";
import { workItemService } from "./service";
import type { WorkItemStatus } from "./statuses";
import type { WorkItem, WorkItemInput } from "./types";

export function useWorkItems(jobOrderId: number) {
  const scope = useOrganizationScope();
  const scopeKey = organizationScopeKey(scope);
  return useQuery({
    queryKey: queryKeys.workItems.byJobOrder(jobOrderId, scopeKey),
    queryFn: () => workItemService.list(jobOrderId, scope),
    enabled: !Number.isNaN(jobOrderId),
  });
}

export function useAllWorkItems() {
  const scope = useOrganizationScope();
  const scopeKey = organizationScopeKey(scope);
  return useQuery({
    queryKey: queryKeys.workItems.all(scopeKey),
    queryFn: () => workItemService.list(undefined, scope),
  });
}

export function useCreateWorkItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkItemInput) => workItemService.create(input),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.workItems.root }),
        qc.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]),
  });
}

export function useUpdateWorkItemStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: WorkItemStatus }) =>
      workItemService.updateStatus(id, status),
    // Optimistic: reflect the new status across every work-item query instantly.
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: queryKeys.workItems.root });
      const snapshots = qc.getQueriesData<WorkItem[]>({
        queryKey: queryKeys.workItems.root,
      });
      qc.setQueriesData<WorkItem[]>(
        { queryKey: queryKeys.workItems.root },
        (old) =>
          old?.map((w) => (w.id === id ? { ...w, status } : w)),
      );
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots?.forEach(([key, data]) =>
        qc.setQueryData(key, data),
      );
    },
    onSettled: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.workItems.root }),
        qc.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
      ]),
  });
}
