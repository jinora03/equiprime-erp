import { WILDCARD } from "@/constants/modules";
import type { JobOrder } from "@/features/job-orders/types";
import type { WorkItem } from "@/features/work-items/types";
import type { PermissionKey } from "@/types";
import { hasPermission } from "@/utils/rbac";

/**
 * Actor context used by the mock service-operations access policy.
 *
 * This is intentionally separate from presentation code. A real backend must
 * enforce the same record-level rules server-side; the frontend mock layer
 * mirrors them so every demo surface behaves consistently.
 */
export interface ServiceWorkActor {
  userId: number;
  role: string;
  permissions: PermissionKey[];
}

const ASSIGNED_ONLY_ROLES = new Set(["Mechanic"]);

/** Roles whose service access is limited to records assigned to that user. */
export function isAssignedOnlyServiceActor(actor: ServiceWorkActor): boolean {
  return (
    !actor.permissions.includes(WILDCARD) &&
    ASSIGNED_ONLY_ROLES.has(actor.role)
  );
}

function matchesAssignment(
  actor: ServiceWorkActor,
  assigneeIds: readonly number[],
): boolean {
  return (
    !isAssignedOnlyServiceActor(actor) ||
    assigneeIds.includes(actor.userId)
  );
}

export function canViewJobOrder(
  actor: ServiceWorkActor,
  jobOrder: Pick<JobOrder, "assigneeIds">,
): boolean {
  return (
    hasPermission(actor.permissions, "job-orders:view") &&
    matchesAssignment(actor, jobOrder.assigneeIds)
  );
}

export function canUpdateJobOrder(
  actor: ServiceWorkActor,
  jobOrder: Pick<JobOrder, "assigneeIds">,
): boolean {
  return (
    hasPermission(actor.permissions, "job-orders:update") &&
    matchesAssignment(actor, jobOrder.assigneeIds)
  );
}

export function canUpdateWorkItem(
  actor: ServiceWorkActor,
  workItem: Pick<WorkItem, "assigneeId">,
): boolean {
  if (!hasPermission(actor.permissions, "work-items:update")) return false;
  if (!isAssignedOnlyServiceActor(actor)) return true;
  return workItem.assigneeId === actor.userId;
}
