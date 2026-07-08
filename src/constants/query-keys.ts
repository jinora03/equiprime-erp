import type { UserFilters } from "@/types";

/** TanStack Query key factory — keeps cache keys consistent and typo-free. */
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
    permissions: ["auth", "permissions"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (filters: UserFilters) => ["users", "list", filters] as const,
    detail: (id: number) => ["users", "detail", id] as const,
  },
  departments: {
    all: ["departments"] as const,
    list: (search?: string) => ["departments", "list", search ?? ""] as const,
  },
  roles: {
    all: ["roles"] as const,
    list: (search?: string) => ["roles", "list", search ?? ""] as const,
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
    list: (moduleId: string) => ["records", moduleId, "list"] as const,
    detail: (moduleId: string, id: number) =>
      ["records", moduleId, "detail", id] as const,
  },
  // Work items are children of a job order with fixed statuses (not workflow-driven)
  workItems: {
    root: ["work-items"] as const,
    all: ["work-items", "all"] as const,
    byJobOrder: (jobOrderId: number) =>
      ["work-items", "job-order", jobOrderId] as const,
  },
  // Supporting domain (dropdown sources + inventory) — Phase 2.5
  customers: { all: ["customers"] as const },
  equipment: {
    all: ["equipment"] as const,
    byCustomer: (customerId: number) =>
      ["equipment", "customer", customerId] as const,
  },
  warehouses: { all: ["warehouses"] as const },
  inventory: { all: ["inventory"] as const },
  partsRequests: {
    root: ["parts-requests"] as const,
    byJobOrder: (jobOrderId: number) =>
      ["parts-requests", "job-order", jobOrderId] as const,
  },
} as const;
