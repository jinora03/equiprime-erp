import type { ReactNode } from "react";

import { usePermissions } from "@/hooks/use-permissions";
import { UnauthorizedPage } from "@/pages/unauthorized";
import type { PermissionKey } from "@/types";

interface RequirePermissionProps {
  permission?: PermissionKey;
  children: ReactNode;
}

/**
 * Route-level permission gate. Renders the 403 page (keeping the URL) when the
 * current user lacks the required permission.
 */
export function RequirePermission({
  permission,
  children,
}: RequirePermissionProps) {
  const { can } = usePermissions();

  if (permission && !can(permission)) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
}
