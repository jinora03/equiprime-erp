import assert from "node:assert/strict";

import {
  AppError,
  getErrorMessage,
  normalizeAppError,
} from "@/services/api/errors";
import { coreTest } from "./test-harness";

export const tests = [
  coreTest("native service errors normalize to the stable AppError contract", () => {
    const normalized = normalizeAppError(new Error("Business rule blocked."));
    assert.equal(normalized.code, "CLIENT_ERROR");
    assert.equal(normalized.message, "Business rule blocked.");
  }),

  coreTest("Laravel validation errors map to VALIDATION_ERROR and field errors", () => {
    const normalized = normalizeAppError({
      response: {
        status: 422,
        data: {
          message: "The given data was invalid.",
          errors: {
            dueDate: ["The due date field is required."],
          },
        },
      },
    });

    assert.equal(normalized.code, "VALIDATION_ERROR");
    assert.equal(normalized.status, 422);
    assert.deepEqual(normalized.fieldErrors, {
      dueDate: ["The due date field is required."],
    });
  }),

  coreTest("explicit API error codes and fieldErrors are preserved", () => {
    const normalized = normalizeAppError({
      response: {
        status: 409,
        data: {
          code: "INSUFFICIENT_STOCK",
          message: "Requested quantity exceeds available stock.",
          fieldErrors: { quantity: ["Only 2 units are available."] },
        },
      },
    });

    assert.equal(normalized.code, "INSUFFICIENT_STOCK");
    assert.equal(normalized.status, 409);
    assert.deepEqual(normalized.fieldErrors, {
      quantity: ["Only 2 units are available."],
    });
  }),

  coreTest("FastAPI validation details normalize into field errors", () => {
    const normalized = normalizeAppError({
      response: {
        status: 422,
        data: {
          detail: [
            { loc: ["body", "inventoryItemId"], msg: "Field required" },
            { loc: ["body", "quantity"], msg: "Must be greater than zero" },
          ],
        },
      },
    });

    assert.equal(normalized.code, "VALIDATION_ERROR");
    assert.equal(normalized.message, "Request validation failed.");
    assert.deepEqual(normalized.fieldErrors, {
      inventoryItemId: ["Field required"],
      quantity: ["Must be greater than zero"],
    });
  }),

  coreTest("existing AppError instances are not wrapped again", () => {
    const original = new AppError({ code: "FORBIDDEN", message: "Not allowed." });
    assert.equal(normalizeAppError(original), original);
  }),

  coreTest("unknown failures use the supplied UI fallback", () => {
    assert.equal(getErrorMessage(null, "Please try again."), "Please try again.");
  }),
];
