import type { TransitionConditionType } from "@/types";

export interface ApprovalTaskSeed {
  id: string;
  companyId: string;
  branchId: string;
  workflowId: number;
  workflowVersion: number;
  moduleId: string;
  recordId: number;
  transitionId: string;
  requiredRoles: string[];
  confirmedConditions: TransitionConditionType[];
  requestedById: number;
  requestedByName: string;
  requestedByRole: string;
  requestedAt: string;
}

const HOUR_MS = 3_600_000;
const NOW = Date.now();
const hoursAgo = (hours: number): string =>
  new Date(NOW - hours * HOUR_MS).toISOString();

/**
 * Pending approval examples are relational: they reference live workflow records
 * and transitions by ID. Display details are resolved by the approval service so
 * edits to connected demo records remain visible here.
 */
export const approvalTaskSeed: ApprovalTaskSeed[] = [
  {
    id: "approval-001",
    companyId: "equiprime",
    branchId: "main",
    workflowId: 1,
    workflowVersion: 1,
    moduleId: "job-orders",
    recordId: 1,
    transitionId: "jt6",
    requiredRoles: ["Warehouse Staff"],
    confirmedConditions: [],
    requestedById: 10,
    requestedByName: "Jun Bautista",
    requestedByRole: "Mechanic",
    requestedAt: hoursAgo(20),
  },
  {
    id: "approval-002",
    companyId: "equiprime",
    branchId: "main",
    workflowId: 1,
    workflowVersion: 1,
    moduleId: "job-orders",
    recordId: 13,
    transitionId: "jt2",
    requiredRoles: ["Manager"],
    confirmedConditions: [],
    requestedById: 27,
    requestedByName: "Adrian Valdez",
    requestedByRole: "Mechanic",
    requestedAt: hoursAgo(16),
  },
  {
    id: "approval-003",
    companyId: "equiprime",
    branchId: "davao",
    workflowId: 1,
    workflowVersion: 1,
    moduleId: "job-orders",
    recordId: 8,
    transitionId: "jt2",
    requiredRoles: ["Manager"],
    confirmedConditions: [],
    requestedById: 23,
    requestedByName: "Joel Manalo",
    requestedByRole: "Mechanic",
    requestedAt: hoursAgo(4),
  },
];
