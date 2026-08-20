import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { organizationService } from "@/services/organization.service";

export function useBranches(companyId: string) {
  return useQuery({
    queryKey: queryKeys.organizations.branches(companyId),
    queryFn: () => organizationService.listBranches(companyId),
  });
}
