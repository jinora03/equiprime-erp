import assert from "node:assert/strict";

import { WILDCARD } from "@/constants/modules";
import {
  canUpdateJobOrder,
  canUpdateWorkItem,
  canViewJobOrder,
} from "@/services/service-work-access";
import { coreTest } from "./test-harness";

export const tests = [
  coreTest("assigned mechanics can view Job Orders but cannot mutate the Job Order", () => {
    const actor = {
      userId: 10,
      role: "Mechanic",
      permissions: ["job-orders:view", "job-orders:update", "work-items:update"],
    };
    const job = { assigneeIds: [10, 11] };
    assert.equal(canViewJobOrder(actor, job), true);
    assert.equal(canUpdateJobOrder(actor, job), false);
    assert.equal(canUpdateWorkItem(actor, { assigneeId: 10 }), true);
  }),

  coreTest("mechanics cannot access Job Orders assigned to someone else", () => {
    const actor = {
      userId: 10,
      role: "Mechanic",
      permissions: ["job-orders:view", "job-orders:update"],
    };
    const job = { assigneeIds: [99] };
    assert.equal(canViewJobOrder(actor, job), false);
    assert.equal(canUpdateJobOrder(actor, job), false);
  }),

  coreTest("non-assigned-only roles can access records when their permission allows it", () => {
    const actor = {
      userId: 20,
      role: "Manager",
      permissions: ["job-orders:view", "job-orders:update"],
    };
    const job = { assigneeIds: [99] };
    assert.equal(canViewJobOrder(actor, job), true);
    assert.equal(canUpdateJobOrder(actor, job), true);
  }),

  coreTest("permissions still gate records, while wildcard administrators bypass assignment limits", () => {
    const noPermission = { userId: 10, role: "Mechanic", permissions: [] };
    assert.equal(canViewJobOrder(noPermission, { assigneeIds: [10] }), false);
    assert.equal(canUpdateWorkItem(noPermission, { assigneeId: 10 }), false);

    const admin = { userId: 1, role: "Super Admin", permissions: [WILDCARD] };
    assert.equal(canViewJobOrder(admin, { assigneeIds: [99] }), true);
    assert.equal(canUpdateWorkItem(admin, { assigneeId: 99 }), true);
  }),
];
