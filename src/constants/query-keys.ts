import type { UserFilters } from "@/types";

/** TanStack Query key factory — keeps cache keys consistent and typo-free. */
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
    permissions: ["auth", "permissions"] as const,
  },
  organizations: {
    all: ["organizations"] as const,
    branches: (companyId: string) =>
      ["organizations", "branches", companyId] as const,
  },
  users: {
    all: ["users"] as const,
    list: (filters: UserFilters, scopeKey = "") =>
      ["users", "list", scopeKey, filters] as const,
    detail: (id: number, scopeKey = "") =>
      ["users", "detail", scopeKey, id] as const,
  },
  departments: {
    all: ["departments"] as const,
    list: (search?: string, scopeKey = "") =>
      ["departments", "list", scopeKey, search ?? ""] as const,
  },
  roles: {
    all: ["roles"] as const,
    list: (search?: string, scopeKey = "") =>
      ["roles", "list", scopeKey, search ?? ""] as const,
  },
  permissions: {
    matrix: ["permissions", "matrix"] as const,
    catalog: ["permissions", "catalog"] as const,
  },
  workflows: {
    all: ["workflows"] as const,
    list: ["workflows", "list"] as const,
    detail: (id: number) => ["workflows", "detail", id] as const,
    byModule: (moduleId: string) => ["workflows", "module", moduleId] as const,
  },
  // Generic keys for workflow-driven business records (job-orders, projects, …)
  records: {
    all: (moduleId: string) => ["records", moduleId] as const,
    list: (moduleId: string, scopeKey = "") =>
      ["records", moduleId, "list", scopeKey] as const,
    detail: (moduleId: string, id: number) =>
      ["records", moduleId, "detail", id] as const,
  },
  // Work items are children of a job order with fixed statuses (not workflow-driven)
  workItems: {
    root: ["work-items"] as const,
    all: (scopeKey = "") => ["work-items", "all", scopeKey] as const,
    byJobOrder: (jobOrderId: number, scopeKey = "") =>
      ["work-items", "job-order", scopeKey, jobOrderId] as const,
  },
  // Supporting domain (dropdown sources + inventory)
  customers: {
    all: ["customers"] as const,
    list: (scopeKey = "") => ["customers", "list", scopeKey] as const,
  },
  equipment: {
    all: ["equipment"] as const,
    list: (scopeKey = "") => ["equipment", "list", scopeKey] as const,
    byCustomer: (customerId: number, scopeKey = "") =>
      ["equipment", "customer", scopeKey, customerId] as const,
  },
  warehouses: {
    all: ["warehouses"] as const,
    list: (scopeKey = "") => ["warehouses", "list", scopeKey] as const,
  },
  inventory: {
    all: ["inventory"] as const,
    list: (scopeKey = "") => ["inventory", "list", scopeKey] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    summary: (scopeKey = "") => ["dashboard", "summary", scopeKey] as const,
  },
  partsRequests: {
    root: ["parts-requests"] as const,
    byJobOrder: (jobOrderId: number) =>
      ["parts-requests", "job-order", jobOrderId] as const,
  },
} as const;
