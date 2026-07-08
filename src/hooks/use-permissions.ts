import { useCallback, useMemo } from "react";

import { useAuth } from "@/contexts/auth-context";
import { WILDCARD } from "@/constants/modules";
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "@/utils/rbac";
import type { PermissionKey } from "@/types";

/**
 * Central RBAC hook. Read the current user's permissions and check access.
 *
 *   const { can } = usePermissions();
 *   if (can("users:create")) { ... }
 */
export function usePermissions() {
  const { permissions } = useAuth();

  const can = useCallback(
    (permission: PermissionKey | undefined) =>
      hasPermission(permissions, permission),
    [permissions],
  );

  const canAny = useCallback(
    (required: PermissionKey[]) => hasAnyPermission(permissions, required),
    [permissions],
  );

  const canAll = useCallback(
    (required: PermissionKey[]) => hasAllPermissions(permissions, required),
    [permissions],
  );

  const isSuperAdmin = useMemo(
    () => permissions.includes(WILDCARD),
    [permissions],
  );

  return { permissions, can, canAny, canAll, isSuperAdmin };
}
