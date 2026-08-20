import type { PermissionModule } from "@/types";

/**
 * Canonical module + action catalog. Mirrors the backend
 * (`app/repositories/permission_catalog.py`) so the frontend mock layer and the
 * real API agree on permission keys. A permission key is `<module>:<action>`.
 */

export const ACTION_LABELS: Record<string, string> = {
  view: "View",
  create: "Create",
  update: "Edit",
  delete: "Delete",
  manage: "Manage",
};

const CRUD = ["view", "create", "update", "delete"];
const VIEW_ONLY = ["view"];

interface ModuleDef {
  module: string;
  label: string;
  group: string;
  actions: string[];
}

export const MODULE_DEFS: ModuleDef[] = [
  { module: "dashboard", label: "Dashboard", group: "Overview", actions: VIEW_ONLY },

  // Business
  { module: "crm", label: "CRM", group: "Business", actions: CRUD },
  { module: "customers", label: "Customers", group: "Business", actions: CRUD },
  { module: "sales", label: "Sales", group: "Business", actions: CRUD },
  { module: "purchasing", label: "Purchasing", group: "Business", actions: CRUD },

  // Operations
  { module: "equipment", label: "Equipment", group: "Operations", actions: CRUD },
  { module: "inventory", label: "Inventory", group: "Operations", actions: CRUD },
  { module: "warehouse", label: "Warehouse", group: "Operations", actions: CRUD },

  // Service
  { module: "job-orders", label: "Job Orders", group: "Service", actions: CRUD },
  { module: "work-items", label: "Work Items", group: "Service", actions: CRUD },
  { module: "projects", label: "Projects", group: "Service", actions: CRUD },
  { module: "maintenance", label: "Maintenance", group: "Service", actions: CRUD },

  // People
  { module: "hr", label: "HR", group: "People", actions: CRUD },
  { module: "attendance", label: "Attendance", group: "People", actions: CRUD },
  { module: "payroll", label: "Payroll", group: "People", actions: CRUD },

  // Finance
  { module: "accounting", label: "Accounting", group: "Finance", actions: CRUD },
  { module: "reports", label: "Reports", group: "Finance", actions: VIEW_ONLY },

  // Administration
  { module: "users", label: "User Management", group: "Administration", actions: CRUD },
  { module: "roles", label: "Roles", group: "Administration", actions: CRUD },
  { module: "departments", label: "Departments", group: "Administration", actions: CRUD },
  { module: "workflows", label: "Workflows", group: "Administration", actions: ["view", "manage"] },
  { module: "permissions", label: "Permission Matrix", group: "Administration", actions: ["view", "manage"] },
  { module: "notifications", label: "Notifications", group: "Administration", actions: VIEW_ONLY },
  { module: "settings", label: "Settings", group: "Administration", actions: ["view", "manage"] },
];

export const ALL_MODULE_IDS = MODULE_DEFS.map((m) => m.module);

export const WILDCARD = "*";

/** All permission keys for a module, e.g. "users" -> ["users:view", ...]. */
export function permissionKeysFor(...modules: string[]): string[] {
  return modules.flatMap((module) => {
    const def = MODULE_DEFS.find((m) => m.module === module);
    return def ? def.actions.map((a) => `${module}:${a}`) : [];
  });
}

export const viewKey = (module: string) => `${module}:view`;

export function viewKeys(...modules: string[]): string[] {
  return modules.map(viewKey);
}

/** Serialisable catalog used by the Permission Matrix page (mock mode). */
export function buildCatalog(): PermissionModule[] {
  return MODULE_DEFS.map((m) => ({
    module: m.module,
    label: m.label,
    group: m.group,
    actions: m.actions.map((a) => ({
      key: `${m.module}:${a}`,
      action: a,
      label: ACTION_LABELS[a] ?? a,
    })),
  }));
}
