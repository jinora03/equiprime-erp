import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { workItemService } from "./service";
import type { WorkItemStatus } from "./statuses";
import type { WorkItem, WorkItemInput } from "./types";

export function useWorkItems(jobOrderId: number) {
  return useQuery({
    queryKey: queryKeys.workItems.byJobOrder(jobOrderId),
    queryFn: () => workItemService.list(jobOrderId),
    enabled: !Number.isNaN(jobOrderId),
  });
}

export function useAllWorkItems() {
  return useQuery({
    queryKey: queryKeys.workItems.all,
    queryFn: () => workItemService.list(),
  });
}

export function useCreateWorkItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkItemInput) => workItemService.create(input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.workItems.root }),
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
      qc.invalidateQueries({ queryKey: queryKeys.workItems.root }),
  });
}
