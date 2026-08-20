/** Centralised route paths — referenced by the router, navigation, and guards. */
export const ROUTES = {
  ROOT: "/",
  LOGIN: "/login",

  // Phase 1 — real pages
  DASHBOARD: "/dashboard",
  APPROVALS: "/approvals",
  USERS: "/users",
  USER_DETAIL: "/users/:id",
  DEPARTMENTS: "/departments",
  ROLES: "/roles",
  PERMISSIONS: "/permissions",
  PROFILE: "/profile",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",

  // Phase 1.1 — Workflow admin + workflow-enabled Service modules (real pages)
  WORKFLOWS: "/workflows",
  WORKFLOW_EDITOR: "/workflows/:id",
  JOB_ORDERS: "/job-orders",
  JOB_ORDER_DETAIL: "/job-orders/:id",
  PROJECTS: "/projects",
  MAINTENANCE: "/maintenance",

  // Phase 2+ — Coming Soon placeholders
  CRM: "/crm",
  CUSTOMERS: "/customers",
  EQUIPMENT: "/equipment",
  INVENTORY: "/inventory",
  WAREHOUSE: "/warehouse",
  PURCHASING: "/purchasing",
  SALES: "/sales",
  HR: "/hr",
  ATTENDANCE: "/attendance",
  PAYROLL: "/payroll",
  ACCOUNTING: "/accounting",
  REPORTS: "/reports",

  NOT_FOUND: "*",
} as const;

export const userDetailPath = (id: number | string) => `/users/${id}`;
export const workflowEditorPath = (id: number | string) => `/workflows/${id}`;
export const jobOrderDetailPath = (id: number | string) => `/job-orders/${id}`;
