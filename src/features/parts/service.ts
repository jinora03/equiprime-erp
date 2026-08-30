import { inventoryService } from "@/features/inventory/service";
import type { JobOrder } from "@/features/job-orders/types";
import { delay, nextId } from "@/services/mock/delay";
import { requireMockSessionActor } from "@/services/mock/session-context";
import {
  canUpdateJobOrder,
  type ServiceWorkActor,
} from "@/services/service-work-access";
import { findRegisteredWorkflowRecord } from "@/services/workflow-record-registry";
import { getActiveOrganizationScope } from "@/store/organization.store";
import type { ApprovalActor, OrganizationScope } from "@/types";
import { partsRequestSeed } from "./data";
import type {
  CreatePartsRequestRequest,
  PartsRequest,
  PartsRequestItem,
  PartsRequestResponse,
} from "./types";

/** Parts approvals belong to Warehouse Staff; Super Admin is handled by ApprovalService. */
export const PARTS_APPROVER_ROLES = ["Warehouse Staff"] as const;

/**
 * Parts request service (mock). Owns request state and inventory side-effects.
 * Raising a request reserves stock. Approval releases the reserved stock;
 * rejection frees the reservation. My Approvals is the decision UI.
 */
const clone = (request: PartsRequest): PartsRequest => ({
  ...request,
  items: request.items.map((item) => ({ ...item })),
  decision: request.decision ? { ...request.decision } : undefined,
});

const data: PartsRequest[] = partsRequestSeed.map(clone);
let counter = partsRequestSeed.length;

function inScope(request: PartsRequest, scope: OrganizationScope) {
  return request.companyId === scope.companyId && request.branchId === scope.branchId;
}

export const partsRequestService = {
  listByJobOrder(jobOrderId: number): Promise<PartsRequestResponse[]> {
    return delay(data.filter((request) => request.jobOrderId === jobOrderId).map(clone));
  },

  listForApproval(scope: OrganizationScope): Promise<PartsRequestResponse[]> {
    return delay(
      data
        .filter((request) => inScope(request, scope) && request.status !== "draft")
        .map(clone),
    );
  },

  get(id: number): PartsRequestResponse | null {
    const request = data.find((candidate) => candidate.id === id);
    return request ? clone(request) : null;
  },

  async create(input: CreatePartsRequestRequest): Promise<PartsRequestResponse> {
    if (input.items.length === 0) {
      throw new Error("Add at least one part before creating a request.");
    }

    const scope = getActiveOrganizationScope();
    const requester = requireMockSessionActor();
    // Record-level access is resolved from the registered Job Order instead of
    // trusting ownership/assignee data supplied by the UI. Laravel should make
    // this same check authoritatively when the real backend is connected.
    const jobOrder = findRegisteredWorkflowRecord<JobOrder>(
      "job-orders",
      input.jobOrderId,
    );
    if (
      !jobOrder ||
      jobOrder.companyId !== scope.companyId ||
      jobOrder.branchId !== scope.branchId
    ) {
      throw new Error("Job order not found in the active organization scope.");
    }

    const actor: ServiceWorkActor = {
      userId: requester.id,
      role: requester.role,
      permissions: requester.permissions,
    };
    if (!canUpdateJobOrder(actor, jobOrder)) {
      throw new Error(
        "You can only request parts for job orders assigned to you.",
      );
    }

    const inventory = await inventoryService.list(scope);
    const inventoryById = new Map(inventory.map((item) => [item.id, item]));
    const requestedQuantities = new Map<number, number>();
    for (const item of input.items) {
      requestedQuantities.set(
        item.inventoryItemId,
        (requestedQuantities.get(item.inventoryItemId) ?? 0) + item.quantity,
      );
    }

    const resolvedItems: PartsRequestItem[] = [...requestedQuantities].map(
      ([inventoryItemId, quantity]) => {
        const item = inventoryById.get(inventoryItemId);
        if (!item) {
          throw new Error(
            "Inventory item not found in the active organization scope.",
          );
        }
        return {
          inventoryItemId,
          sku: item.sku,
          name: item.name,
          unit: item.unit,
          quantity,
        };
      },
    );

    const now = new Date().toISOString();
    counter += 1;
    const request: PartsRequest = {
      id: nextId(),
      code: `PR-2026-${String(counter).padStart(4, "0")}`,
      companyId: scope.companyId,
      branchId: scope.branchId,
      jobOrderId: input.jobOrderId,
      // Requests raised while Repair is active belong to the upcoming waiting
      // cycle; requests raised while already waiting belong to the current one.
      jobOrderPartsCycle:
        jobOrder.currentStageId === "jo-waiting-parts"
          ? Math.max(jobOrder.partsCycle, 1)
          : jobOrder.partsCycle + 1,
      status: "pending",
      items: resolvedItems,
      requestedById: requester.id,
      requestedBy: requester.name,
      requestedByRole: requester.role,
      createdAt: now,
      updatedAt: now,
    };

    await inventoryService.reserveMany(
      request.items.map((item) => ({
        id: item.inventoryItemId,
        qty: item.quantity,
      })),
      scope,
    );
    data.unshift(request);
    return clone(request);
  },

  async decide(
    id: number,
    decision: "approve" | "reject",
    actor: ApprovalActor,
    approvalRole: string,
    note?: string,
  ): Promise<PartsRequestResponse> {
    const request = data.find((candidate) => candidate.id === id);
    if (!request) throw new Error("Parts request not found.");
    if (request.status !== "pending") {
      throw new Error("This parts request is already resolved.");
    }
    if (decision === "reject" && !note?.trim()) {
      throw new Error("Add a reason before rejecting.");
    }

    if (decision === "approve") {
      await inventoryService.releaseMany(
        request.items.map((item) => ({
          id: item.inventoryItemId,
          qty: item.quantity,
        })),
        { companyId: request.companyId, branchId: request.branchId },
      );
      // Demo shortcut: an approved warehouse request is released immediately.
      // A real backend may split business approval and physical fulfillment.
      request.status = "released";
    } else {
      await inventoryService.unreserveMany(
        request.items.map((item) => ({
          id: item.inventoryItemId,
          qty: item.quantity,
        })),
        { companyId: request.companyId, branchId: request.branchId },
      );
      request.status = "rejected";
    }

    const now = new Date().toISOString();
    request.decision = {
      approvalRole,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      at: now,
      note: note?.trim() || undefined,
    };
    request.updatedAt = now;
    return clone(request);
  },

};
