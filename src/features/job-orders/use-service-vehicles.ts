import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import {
  organizationScopeKey,
  useOrganizationScope,
} from "@/store/organization.store";
import { serviceVehicleService } from "./service-vehicle-service";

export function useServiceVehicles() {
  const scope = useOrganizationScope();
  const scopeKey = organizationScopeKey(scope);
  return useQuery({
    queryKey: queryKeys.serviceVehicles.list(scopeKey),
    queryFn: () => serviceVehicleService.list(scope),
  });
}
