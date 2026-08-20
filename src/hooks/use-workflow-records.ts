import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import type { RecordStore } from "@/services/workflow-records";
import type { WorkflowRecord } from "@/types";

/**
 * Generic TanStack Query hooks for configurable workflow-driven records such as
 * Job Orders, Projects, and Maintenance, so list/move/create caching behaves
 * consistently across those modules.
 */

export function useRecords<T extends WorkflowRecord>(
  moduleId: string,
  store: Pick<RecordStore<T>, "list">,
) {
  return useQuery({
    queryKey: queryKeys.records.list(moduleId),
    queryFn: () => store.list(),
  });
}

export function useMoveRecordStage<T extends WorkflowRecord>(
  moduleId: string,
  store: Pick<RecordStore<T>, "moveStage">,
) {
  const qc = useQueryClient();
  const listKey = queryKeys.records.list(moduleId);

  return useMutation({
    mutationFn: (vars: {
      id: number;
      toStageId: string;
      actor: string;
      note?: string;
    }) => store.moveStage(vars.id, vars.toStageId, vars.actor, vars.note),

    // Optimistic update: move the record in the cache immediately so the Kanban
    // card lands in the destination column with no snap-back / flicker.
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: queryKeys.records.all(moduleId) });
      const previous = qc.getQueryData<T[]>(listKey);
      qc.setQueryData<T[]>(listKey, (old) =>
        old?.map((r) =>
          r.id === vars.id ? { ...r, currentStageId: vars.toStageId } : r,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(listKey, context.previous);
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: queryKeys.records.all(moduleId) }),
  });
}

export function useCreateRecord<T extends WorkflowRecord, I>(
  moduleId: string,
  create: (input: I) => Promise<T>,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: I) => create(input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.records.all(moduleId) }),
  });
}
