import type { ReactNode } from "react";

import { usePermissions } from "@/hooks/use-permissions";
import type { PermissionKey } from "@/types";

interface PermissionGuardProps {
  /** Single permission required. */
  permission?: PermissionKey;
  /** Allowed if the user holds ANY of these. */
  anyOf?: PermissionKey[];
  /** Allowed only if the user holds ALL of these. */
  allOf?: PermissionKey[];
  /** Rendered when access is denied (defaults to nothing). */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Conditionally renders UI based on the current user's permissions. Use it to
 * gate buttons, menu entries, and sections.
 *
 *   <PermissionGuard permission="users:create">
 *     <Button>Add user</Button>
 *   </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  anyOf,
  allOf,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { can, canAny, canAll } = usePermissions();

  const allowed =
    (permission ? can(permission) : true) &&
    (anyOf ? canAny(anyOf) : true) &&
    (allOf ? canAll(allOf) : true);

  return <>{allowed ? children : fallback}</>;
}
