import { WILDCARD } from "@/constants/modules";
import type { PermissionKey } from "@/types";

/**
 * Core RBAC predicate. `*` is the super-admin wildcard granting everything.
 * A `<module>:manage` grant implies all other actions on that module.
 */
export function hasPermission(
  granted: PermissionKey[],
  required: PermissionKey | undefined,
): boolean {
  if (!required) return true;
  if (granted.includes(WILDCARD)) return true;
  if (granted.includes(required)) return true;

  // module:manage implies any action on that module
  const [module] = required.split(":");
  if (module && granted.includes(`${module}:manage`)) return true;

  return false;
}

export function hasAnyPermission(
  granted: PermissionKey[],
  required: PermissionKey[],
): boolean {
  if (required.length === 0) return true;
  return required.some((p) => hasPermission(granted, p));
}

export function hasAllPermissions(
  granted: PermissionKey[],
  required: PermissionKey[],
): boolean {
  return required.every((p) => hasPermission(granted, p));
}
