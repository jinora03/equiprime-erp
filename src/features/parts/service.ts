import { inventoryService } from "@/features/inventory/service";
import { delay, nextId } from "@/services/mock/delay";
import { getActiveOrganizationScope } from "@/store/organization.store";
import type { ApprovalActor, OrganizationScope } from "@/types";
import { partsRequestSeed } from "./data";
import type { PartsRequest, PartsRequestInput } from "./types";

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
  listByJobOrder(jobOrderId: number): Promise<PartsRequest[]> {
    return delay(data.filter((request) => request.jobOrderId === jobOrderId).map(clone));
  },

  listForApproval(scope: OrganizationScope): Promise<PartsRequest[]> {
    return delay(
      data
        .filter((request) => inScope(request, scope) && request.status !== "draft")
        .map(clone),
    );
  },

  get(id: number): PartsRequest | null {
    const request = data.find((candidate) => candidate.id === id);
    return request ? clone(request) : null;
  },

  async create(input: PartsRequestInput): Promise<PartsRequest> {
    const now = new Date().toISOString();
    const scope = getActiveOrganizationScope();
    counter += 1;
    const request: PartsRequest = {
      id: nextId(),
      code: `PR-2026-${String(counter).padStart(4, "0")}`,
      companyId: scope.companyId,
      branchId: scope.branchId,
      jobOrderId: input.jobOrderId,
      status: "pending",
      items: input.items.map((item) => ({ ...item })),
      requestedById: input.requestedBy.id,
      requestedBy: input.requestedBy.name,
      requestedByRole: input.requestedBy.role,
      createdAt: now,
      updatedAt: now,
    };

    await Promise.all(
      request.items.map((item) =>
        inventoryService.reserve(item.inventoryItemId, item.quantity),
      ),
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
  ): Promise<PartsRequest> {
    const request = data.find((candidate) => candidate.id === id);
    if (!request) throw new Error("Parts request not found.");
    if (request.status !== "pending") {
      throw new Error("This parts request is already resolved.");
    }
    if (decision === "reject" && !note?.trim()) {
      throw new Error("Add a reason before rejecting.");
    }

    if (decision === "approve") {
      await Promise.all(
        request.items.map((item) =>
          inventoryService.release(item.inventoryItemId, item.quantity),
        ),
      );
      // Demo shortcut: an approved warehouse request is released immediately.
      // A real backend may split business approval and physical fulfillment.
      request.status = "released";
    } else {
      await Promise.all(
        request.items.map((item) =>
          inventoryService.unreserve(item.inventoryItemId, item.quantity),
        ),
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
