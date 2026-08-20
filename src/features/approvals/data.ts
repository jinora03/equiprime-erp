import type { TransitionConditionType } from "@/types";

export interface ApprovalTaskSeed {
  id: string;
  companyId: string;
  branchId: string;
  workflowId: number;
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
    moduleId: "job-orders",
    recordId: 1,
    transitionId: "jt6",
    requiredRoles: ["Warehouse Staff"],
    confirmedConditions: [],
    requestedById: 10,
    requestedByName: "Jun Bautista",
    requestedByRole: "Technician",
    requestedAt: "2026-06-26T10:15:00Z",
  },
  {
    id: "approval-002",
    companyId: "equiprime",
    branchId: "main",
    workflowId: 1,
    moduleId: "job-orders",
    recordId: 5,
    transitionId: "jt8",
    requiredRoles: ["Manager"],
    confirmedConditions: ["qa_passed"],
    requestedById: 10,
    requestedByName: "Jun Bautista",
    requestedByRole: "Technician",
    requestedAt: "2026-06-30T15:20:00Z",
  },
  {
    id: "approval-003",
    companyId: "equiprime",
    branchId: "davao",
    workflowId: 1,
    moduleId: "job-orders",
    recordId: 8,
    transitionId: "jt2",
    requiredRoles: ["Manager"],
    confirmedConditions: [],
    requestedById: 23,
    requestedByName: "Joel Manalo",
    requestedByRole: "Technician",
    requestedAt: "2026-07-01T07:05:00Z",
  },
];
