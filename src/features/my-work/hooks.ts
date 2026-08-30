import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { useAuth } from "@/contexts/auth-context";
import {
  organizationScopeKey,
  useOrganizationScope,
} from "@/store/organization.store";
import { myWorkService } from "./service";

export function useMyWork() {
  const { user, permissions } = useAuth();
  const scope = useOrganizationScope();
  const scopeKey = organizationScopeKey(scope);
  const actorKey = user
    ? `${user.id}:${user.role}:${permissions.join("|")}`
    : "signed-out";

  return useQuery({
    queryKey: queryKeys.myWork.list(scopeKey, actorKey),
    queryFn: () =>
      user
        ? myWorkService.get(scope)
        : Promise.resolve({ jobOrders: [], workItems: [] }),
    enabled: Boolean(user),
  });
}
