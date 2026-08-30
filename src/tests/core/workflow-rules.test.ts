import assert from "node:assert/strict";

import { WORKFLOWS } from "@/services/mock/workflow-data";
import {
  evaluateWorkflowMove,
  getOutgoingTransitions,
  type ConditionContext,
} from "@/services/workflow-rules";
import { coreTest } from "./test-harness";

const workflow = WORKFLOWS.find((candidate) => candidate.moduleId === "job-orders");
if (!workflow) throw new Error("Job Order workflow seed is required for core tests.");

const context = (overrides: Partial<ConditionContext> = {}): ConditionContext => ({
  allWorkItemsCompleted: false,
  partsReleased: false,
  supervisorApproved: false,
  qaPassed: false,
  ...overrides,
});

const updateActor = {
  permissions: ["job-orders:update"],
  actorRole: "Service Advisor",
};

export const tests = [
  coreTest("workflow exposes only configured outgoing transitions", () => {
    const outgoing = getOutgoingTransitions(workflow, "jo-draft");
    assert.deepEqual(outgoing.map((transition) => transition.toStageId), ["jo-submitted"]);
  }),

  coreTest("workflow rejects an invalid direct stage jump", () => {
    const result = evaluateWorkflowMove(
      workflow,
      "jo-draft",
      "jo-repair",
      context(),
      updateActor,
    );
    assert.equal(result.allowed, false);
    assert.match(result.reason ?? "", /not an allowed transition/i);
  }),

  coreTest("workflow rejects moves without module update permission", () => {
    const result = evaluateWorkflowMove(
      workflow,
      "jo-draft",
      "jo-submitted",
      context(),
      { permissions: ["job-orders:view"], actorRole: "Viewer" },
    );
    assert.equal(result.allowed, false);
    assert.match(result.reason ?? "", /permission/i);
  }),

  coreTest("manager approval is required before Submitted can become Approved", () => {
    const result = evaluateWorkflowMove(
      workflow,
      "jo-submitted",
      "jo-approved",
      context(),
      { permissions: ["job-orders:update"], actorRole: "Manager" },
    );
    assert.equal(result.allowed, false);
    assert.deepEqual(result.approverRoles, ["Manager"]);
    assert.match(result.reason ?? "", /approval/i);
  }),

  coreTest("completed manager approval permits Submitted to Approved", () => {
    const result = evaluateWorkflowMove(
      workflow,
      "jo-submitted",
      "jo-approved",
      context(),
      {
        permissions: ["job-orders:update"],
        actorRole: "Manager",
        evidence: { approvedRoles: ["Manager"] },
      },
    );
    assert.equal(result.allowed, true);
  }),

  coreTest("Waiting for Parts cannot resume while current-cycle parts are unreleased", () => {
    const result = evaluateWorkflowMove(
      workflow,
      "jo-waiting-parts",
      "jo-repair",
      context({ partsReleased: false }),
      {
        permissions: ["job-orders:update"],
        actorRole: "Warehouse Staff",
        evidence: { approvedRoles: ["Warehouse Staff"] },
      },
    );
    assert.equal(result.allowed, false);
    assert.match(result.reason ?? "", /parts released/i);
  }),

  coreTest("automatic conditions cannot be self-confirmed as manual evidence", () => {
    const result = evaluateWorkflowMove(
      workflow,
      "jo-waiting-parts",
      "jo-repair",
      context({ partsReleased: false }),
      {
        permissions: ["job-orders:update"],
        actorRole: "Warehouse Staff",
        evidence: {
          approvedRoles: ["Warehouse Staff"],
          confirmedConditions: ["parts_released"],
        },
      },
    );
    assert.equal(result.allowed, false);
    assert.match(result.reason ?? "", /parts released/i);
  }),

  coreTest("Waiting for Parts resumes when released parts and warehouse approval are both present", () => {
    const result = evaluateWorkflowMove(
      workflow,
      "jo-waiting-parts",
      "jo-repair",
      context({ partsReleased: true }),
      {
        permissions: ["job-orders:update"],
        actorRole: "Warehouse Staff",
        evidence: { approvedRoles: ["Warehouse Staff"] },
      },
    );
    assert.equal(result.allowed, true);
  }),

  coreTest("Repair can complete only after actual work items are completed", () => {
    const blocked = evaluateWorkflowMove(
      workflow,
      "jo-repair",
      "jo-completed",
      context({ allWorkItemsCompleted: false }),
      updateActor,
    );
    assert.equal(blocked.allowed, false);

    const allowed = evaluateWorkflowMove(
      workflow,
      "jo-repair",
      "jo-completed",
      context({ allWorkItemsCompleted: true }),
      updateActor,
    );
    assert.equal(allowed.allowed, true);
  }),
];
