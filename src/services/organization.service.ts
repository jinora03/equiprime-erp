import { delay } from "@/services/mock/delay";
import { branches, companies } from "@/services/mock/organization-data";
import type { Branch, Company, OrganizationScope } from "@/types";

/**
 * Organization lookup boundary. It is mock-backed today; a real backend can
 * replace these bodies without changing the switcher or organization scope
 * store.
 */
export const organizationService = {
  listCompanies(): Promise<Company[]> {
    return delay(companies.map((company) => ({ ...company })));
  },

  listBranches(companyId: string): Promise<Branch[]> {
    return delay(
      branches
        .filter((branch) => branch.companyId === companyId)
        .map((branch) => ({ ...branch })),
    );
  },

  getBranch(scope: OrganizationScope): Promise<Branch> {
    const branch = branches.find(
      (item) =>
        item.companyId === scope.companyId && item.id === scope.branchId,
    );
    if (!branch) return Promise.reject(new Error("Organization branch not found."));
    return delay({ ...branch });
  },
};
