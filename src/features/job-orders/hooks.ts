import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { useAuth } from "@/contexts/auth-context";
import {
  organizationScopeKey,
  useOrganizationScope,
} from "@/store/organization.store";
import { jobOrderService } from "./service";

/** Actor-aware Job Order query; mechanics receive only their assigned records. */
export function useJobOrders() {
  const { user, permissions } = useAuth();
  const scope = useOrganizationScope();
  const scopeKey = organizationScopeKey(scope);
  const actorKey = user
    ? `${user.id}:${user.role}:${permissions.join("|")}`
    : "signed-out";

  return useQuery({
    queryKey: queryKeys.records.list("job-orders", scopeKey, actorKey),
    queryFn: () =>
      user
        ? jobOrderService.listForActor(
            {
              userId: user.id,
              role: user.role,
              permissions,
            },
            scope,
          )
        : Promise.resolve([]),
    enabled: Boolean(user),
  });
}
