import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import {
  organizationScopeKey,
  useOrganizationScope,
} from "@/store/organization.store";
import { customerService } from "./service";

export function useCustomers() {
  const scope = useOrganizationScope();
  const scopeKey = organizationScopeKey(scope);
  return useQuery({
    queryKey: queryKeys.customers.list(scopeKey),
    queryFn: () => customerService.list(scope),
  });
}
