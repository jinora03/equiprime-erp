import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { useAuth } from "@/contexts/auth-context";
import {
  organizationScopeKey,
  useOrganizationScope,
} from "@/store/organization.store";
import type {
  ApprovalActor,
  ApprovalDecisionInput,
  ApprovalRequestInput,
} from "@/types";
import { approvalService } from "./service";

function useApprovalActor(): ApprovalActor | null {
  const { user, permissions } = useAuth();
  if (!user) return null;
  return {
    id: user.id,
    name: user.full_name,
    role: user.role,
    permissions,
  };
}

export function useMyApprovals() {
  const scope = useOrganizationScope();
  const actor = useApprovalActor();
  const scopeKey = organizationScopeKey(scope);

  return useQuery({
    queryKey: queryKeys.approvals.list(
      scopeKey,
      actor ? `${actor.id}:${actor.role}` : "anonymous",
    ),
    queryFn: () => {
      if (!actor) return [];
      return approvalService.listForActor(scope, actor);
    },
    enabled: !!actor,
  });
}

export function useRequestApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ApprovalRequestInput) => approvalService.request(input),
    onSettled: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.approvals.all }),
        qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
      ]),
  });
}

export function useDecideApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ApprovalDecisionInput) => approvalService.decide(input),
    onSettled: (task) => {
      void qc.invalidateQueries({ queryKey: queryKeys.approvals.all });
      void qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      if (task?.kind === "parts_request") {
        void qc.invalidateQueries({ queryKey: queryKeys.partsRequests.root });
        void qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
      } else if (task) {
        void qc.invalidateQueries({ queryKey: queryKeys.records.all(task.moduleId) });
      }
    },
  });
}
