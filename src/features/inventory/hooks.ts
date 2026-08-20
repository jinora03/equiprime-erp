import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import {
  organizationScopeKey,
  useOrganizationScope,
} from "@/store/organization.store";
import { inventoryService } from "./service";

export function useInventory() {
  const scope = useOrganizationScope();
  const scopeKey = organizationScopeKey(scope);
  return useQuery({
    queryKey: queryKeys.inventory.list(scopeKey),
    queryFn: () => inventoryService.list(scope),
  });
}
