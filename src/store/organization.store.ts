import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { OrganizationScope } from "@/types";

const DEFAULT_SCOPE: OrganizationScope = {
  companyId: "equiprime",
  branchId: "main",
};

interface OrganizationState {
  activeCompanyId: string;
  activeBranchId: string;
  setOrganizationScope: (scope: OrganizationScope) => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      activeCompanyId: DEFAULT_SCOPE.companyId,
      activeBranchId: DEFAULT_SCOPE.branchId,
      setOrganizationScope: (scope) =>
        set({
          activeCompanyId: scope.companyId,
          activeBranchId: scope.branchId,
        }),
    }),
    {
      name: "equiprime.organization",
      partialize: (state) => ({
        activeCompanyId: state.activeCompanyId,
        activeBranchId: state.activeBranchId,
      }),
    },
  ),
);

export function getActiveOrganizationScope(): OrganizationScope {
  const { activeCompanyId, activeBranchId } = useOrganizationStore.getState();
  return { companyId: activeCompanyId, branchId: activeBranchId };
}

export function organizationScopeKey(scope: OrganizationScope): string {
  return `${scope.companyId}:${scope.branchId}`;
}

export function useOrganizationScope(): OrganizationScope {
  const companyId = useOrganizationStore((state) => state.activeCompanyId);
  const branchId = useOrganizationStore((state) => state.activeBranchId);
  return { companyId, branchId };
}
