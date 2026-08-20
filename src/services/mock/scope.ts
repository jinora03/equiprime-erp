import { getActiveOrganizationScope } from "@/store/organization.store";
import type { OrganizationScope } from "@/types";

export interface OrganizationScopedEntity {
  companyId: string;
  branchId: string;
}

export function resolveOrganizationScope(
  scope?: OrganizationScope,
): OrganizationScope {
  return scope ?? getActiveOrganizationScope();
}

export function matchesOrganizationScope(
  entity: OrganizationScopedEntity,
  scope?: OrganizationScope,
): boolean {
  const active = resolveOrganizationScope(scope);
  return (
    entity.companyId === active.companyId && entity.branchId === active.branchId
  );
}
