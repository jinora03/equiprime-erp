import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import {
  organizationScopeKey,
  useOrganizationScope,
} from "@/store/organization.store";
import { equipmentService } from "./service";

export function useEquipment() {
  const scope = useOrganizationScope();
  const scopeKey = organizationScopeKey(scope);
  return useQuery({
    queryKey: queryKeys.equipment.list(scopeKey),
    queryFn: () => equipmentService.list(scope),
  });
}

export function useEquipmentByCustomer(customerId?: number) {
  const scope = useOrganizationScope();
  const scopeKey = organizationScopeKey(scope);
  return useQuery({
    queryKey: queryKeys.equipment.byCustomer(customerId ?? 0, scopeKey),
    queryFn: () => equipmentService.listByCustomer(customerId as number, scope),
    enabled: customerId != null && !Number.isNaN(customerId),
  });
}
