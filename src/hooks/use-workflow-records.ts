import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import type { RecordStore } from "@/services/workflow-records";
import type { WorkflowMoveEvidence } from "@/services/workflow-rules";
import type { PermissionKey, WorkflowRecord } from "@/types";

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
      permissions: PermissionKey[];
      actorRole?: string | null;
      note?: string;
      evidence?: WorkflowMoveEvidence;
    }) =>
      store.moveStage(vars.id, vars.toStageId, {
        actor: vars.actor,
        permissions: vars.permissions,
        actorRole: vars.actorRole,
        note: vars.note,
        evidence: vars.evidence,
      }),

    // Do not optimistically move a card before the service has validated the
    // workflow transition. Invalid drops therefore never become UI state.
    onSuccess: (updated) => {
      qc.setQueryData<T[]>(listKey, (old) =>
        old?.map((record) => (record.id === updated.id ? updated : record)),
      );
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
