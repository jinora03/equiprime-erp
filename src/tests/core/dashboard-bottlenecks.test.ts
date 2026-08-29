import assert from "node:assert/strict";

import { detectBottlenecks } from "@/features/dashboard/service-metrics";
import type { JobOrder } from "@/features/job-orders/types";
import type { ApprovalTask } from "@/types";
import { coreTest } from "./test-harness";

const NOW = "2026-08-30T04:00:00Z";

function job(overrides: Partial<JobOrder> = {}): JobOrder {
  return {
    id: 101,
    code: "JO-2026-0999",
    title: "Approval Test Job",
    moduleId: "job-orders",
    companyId: "equiprime",
    branchId: "main",
    currentStageId: "jo-submitted",
    history: [
      {
        id: "history-1",
        fromStageId: "jo-draft",
        toStageId: "jo-submitted",
        actor: "Carlos Aquino",
        at: "2026-08-29T03:00:00Z",
      },
    ],
    assignee: "Jun Bautista",
    assigneeIds: [10],
    customer: "ABC Construction",
    customerId: 1,
    equipment: "Excavator EX-101",
    equipmentId: 1,
    serviceVehicleId: 1,
    serviceVehicle: "SV-01",
    workflowId: 1,
    workflowVersion: 1,
    priority: "High",
    partsCycle: 0,
    dueDate: "2026-09-10",
    createdAt: "2026-08-28T04:00:00Z",
    updatedAt: "2026-08-29T03:00:00Z",
    ...overrides,
  };
}

function approval(overrides: Partial<ApprovalTask> = {}): ApprovalTask {
  return {
    id: "approval-test",
    kind: "workflow_transition",
    companyId: "equiprime",
    branchId: "main",
    workflowId: 1,
    workflowVersion: 1,
    moduleId: "job-orders",
    moduleLabel: "Job Orders",
    recordId: 101,
    recordCode: "JO-2026-0999",
    recordTitle: "Approval Test Job",
    transitionId: "jt2",
    transitionLabel: "Approve",
    fromStageId: "jo-submitted",
    fromStageName: "Submitted",
    toStageId: "jo-approved",
    toStageName: "Approved",
    requiredRoles: ["Manager"],
    approverAssignments: [
      {
        role: "Manager",
        people: [{ id: 7, name: "Grace Tan", jobTitle: "Purchasing Manager" }],
      },
    ],
    confirmedConditions: [],
    context: [],
    requestedById: 10,
    requestedByName: "Jun Bautista",
    requestedByRole: "Mechanic",
    requestedAt: "2026-08-29T08:00:00Z",
    status: "pending",
    decisions: [],
    ...overrides,
  };
}

export const tests = [
  coreTest("dashboard bottlenecks identify the actual approval owner", () => {
    const result = detectBottlenecks({
      jobOrders: [job()],
      partsRequests: [],
      workItems: [],
      approvalTasks: [approval()],
      now: NOW,
    });

    assert.equal(result[0]?.kind, "workflow_approval_wait");
    assert.equal(result[0]?.reason, "Approval pending");
    assert.match(result[0]?.detail ?? "", /Manager · Grace Tan/);
  }),

  coreTest("dashboard no longer treats assignment as a bottleneck", () => {
    const result = detectBottlenecks({
      jobOrders: [
        job({
          assignee: null,
          assigneeIds: [],
          currentStageId: "jo-approved",
          createdAt: "2026-08-30T03:30:00Z",
          updatedAt: "2026-08-30T03:30:00Z",
          history: [],
        }),
      ],
      partsRequests: [],
      workItems: [],
      now: NOW,
    });

    assert.equal(result.some((item) => item.reason === "No mechanic assigned"), false);
  }),
];
