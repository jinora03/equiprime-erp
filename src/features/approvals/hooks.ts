import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { useAuth } from "@/contexts/auth-context";
import {
  organizationScopeKey,
  useOrganizationScope,
} from "@/store/organization.store";
import type {
  ApprovalDecisionInput,
  ApprovalRequestInput,
} from "@/types";
import { approvalService } from "./service";

export function useMyApprovals() {
  const scope = useOrganizationScope();
  const { user, permissions } = useAuth();
  const scopeKey = organizationScopeKey(scope);
  const actorKey = user
    ? `${user.id}:${user.role}:${permissions.join("|")}`
    : "anonymous";

  return useQuery({
    queryKey: queryKeys.approvals.list(scopeKey, actorKey),
    queryFn: () => approvalService.list(scope),
    enabled: Boolean(user),
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
