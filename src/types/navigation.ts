import type { LucideIcon } from "lucide-react";

import type { PermissionKey } from "./permission";

export interface NavItem {
  /** Stable id, usually the module id. */
  id: string;
  label: string;
  /** Absolute route path. */
  path: string;
  icon: LucideIcon;
  /** Permission required to see/access this item. */
  permission?: PermissionKey;
  /** Optional badge (e.g. notification count or "Soon"). */
  badge?: string | number;
  /** Marks Phase 2+ modules that route to the Coming Soon page. */
  comingSoon?: boolean;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}
