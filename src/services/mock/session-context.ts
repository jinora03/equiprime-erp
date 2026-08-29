import { useAuthStore } from "@/store/auth.store";
import type { ApprovalActor, PermissionKey } from "@/types";
import { hasPermission } from "@/utils/rbac";

/**
 * Demo-only authenticated actor resolver.
 *
 * Public UI/service commands intentionally do not carry actor identity, roles,
 * or permissions. The mock service layer derives those values from the current
 * session so its contracts match the future Laravel API more closely.
 * Production Laravel must resolve the actor from server-side authentication and
 * never trust identity/permission claims sent by the browser.
 */
export function requireMockSessionActor(): ApprovalActor {
  const { user, permissions } = useAuthStore.getState();
  if (!user) throw new Error("You must be signed in to perform this action.");

  return {
    id: user.id,
    name: user.full_name,
    role: user.role,
    permissions: [...permissions],
  };
}

export function requireMockPermission(permission: PermissionKey): ApprovalActor {
  const actor = requireMockSessionActor();
  if (!hasPermission(actor.permissions, permission)) {
    throw new Error("You don't have permission to perform this action.");
  }
  return actor;
}
