import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import {
  organizationScopeKey,
  useOrganizationScope,
} from "@/store/organization.store";
import { dashboardService } from "./service";

export function useDashboardData() {
  const scope = useOrganizationScope();
  return useQuery({
    queryKey: queryKeys.dashboard.summary(organizationScopeKey(scope)),
    queryFn: () => dashboardService.get(scope),
  });
}
