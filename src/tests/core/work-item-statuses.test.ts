import assert from "node:assert/strict";

import {
  areAllWorkItemsComplete,
  canTransitionWorkItemStatus,
} from "@/features/work-items/statuses";
import { coreTest } from "./test-harness";

export const tests = [
  coreTest("an empty work-item list does not satisfy the Job Order completion gate", () => {
    assert.equal(areAllWorkItemsComplete([]), false);
  }),

  coreTest("the completion gate requires every existing work item to be completed", () => {
    assert.equal(
      areAllWorkItemsComplete([{ status: "completed" }, { status: "completed" }]),
      true,
    );
    assert.equal(
      areAllWorkItemsComplete([{ status: "completed" }, { status: "in_progress" }]),
      false,
    );
  }),

  coreTest("work-item status changes follow the fixed lifecycle", () => {
    assert.equal(canTransitionWorkItemStatus("not_started", "in_progress"), true);
    assert.equal(canTransitionWorkItemStatus("not_started", "completed"), false);
    assert.equal(canTransitionWorkItemStatus("in_progress", "completed"), true);
    assert.equal(canTransitionWorkItemStatus("completed", "in_progress"), true);
  }),
];
