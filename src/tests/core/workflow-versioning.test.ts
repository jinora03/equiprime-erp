import assert from "node:assert/strict";

import { workflowService } from "@/services/workflow.service";
import { useAuthStore } from "@/store/auth.store";
import type { PermissionKey, User } from "@/types";
import { coreTest } from "./test-harness";

const testUser: User = {
  id: 9001,
  first_name: "Core",
  last_name: "Tester",
  full_name: "Core Tester",
  email: "core.tester@example.test",
  company_id: "equiprime",
  branch_id: "main",
  department: "Engineering",
  role: "Super Admin",
  status: "active",
};

function setSession(permissions: PermissionKey[]) {
  useAuthStore.setState({
    token: "core-test-token",
    user: testUser,
    permissions,
    status: "authenticated",
  });
}

export const tests = [
  coreTest("workflow edits require workflows:manage permission", async () => {
    setSession(["workflows:view"]);
    await assert.rejects(
      () => workflowService.update(3, { description: "Unauthorized edit" }),
      /permission/i,
    );
    assert.equal((await workflowService.get(3)).version, 1);
  }),

  coreTest("workflow edits create a new immutable version", async () => {
    setSession(["workflows:manage"]);
    const original = await workflowService.get(3, 1);
    const revisedName = `${original.name} — Revised`;
    const revised = await workflowService.update(3, { name: revisedName });

    assert.equal(revised.version, 2);
    assert.equal(revised.name, revisedName);

    const stillV1 = await workflowService.get(3, 1);
    assert.equal(stillV1.version, 1);
    assert.equal(stillV1.name, original.name);
  }),

  coreTest("new records resolve the latest active workflow version", async () => {
    const latest = await workflowService.getByModule("projects");
    assert.ok(latest);
    assert.equal(latest.version, 2);
    assert.match(latest.name, /Revised$/);
  }),
];
