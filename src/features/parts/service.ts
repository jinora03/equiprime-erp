import { delay, nextId } from "@/services/mock/delay";
import { inventoryService } from "@/features/inventory/service";
import { partsRequestSeed } from "./data";
import type {
  PartsRequest,
  PartsRequestInput,
  PartsRequestStatus,
} from "./types";

/**
 * Parts request service (mock). Owns the request lifecycle and its inventory
 * side-effects: raising a request reserves stock; releasing consumes it; a
 * rejection frees the reservation. Job orders never touch inventory directly.
 */

const clone = (r: PartsRequest): PartsRequest => ({
  ...r,
  items: r.items.map((i) => ({ ...i })),
});

const data: PartsRequest[] = partsRequestSeed.map(clone);
let counter = partsRequestSeed.length;

export const partsRequestService = {
  listByJobOrder(jobOrderId: number): Promise<PartsRequest[]> {
    return delay(data.filter((r) => r.jobOrderId === jobOrderId).map(clone));
  },

  async create(input: PartsRequestInput): Promise<PartsRequest> {
    const now = new Date().toISOString();
    counter += 1;
    const request: PartsRequest = {
      id: nextId(),
      code: `PR-2026-${String(counter).padStart(4, "0")}`,
      jobOrderId: input.jobOrderId,
      status: "pending",
      items: input.items.map((i) => ({ ...i })),
      requestedBy: input.requestedBy,
      createdAt: now,
      updatedAt: now,
    };
    // Reserve stock while the request is pending.
    await Promise.all(
      request.items.map((it) =>
        inventoryService.reserve(it.inventoryItemId, it.quantity),
      ),
    );
    data.unshift(request);
    return delay(clone(request));
  },

  async setStatus(
    id: number,
    status: PartsRequestStatus,
  ): Promise<PartsRequest> {
    const request = data.find((r) => r.id === id);
    if (!request) throw new Error("Parts request not found");
    const prev = request.status;

    if (status === "rejected" && (prev === "pending" || prev === "approved")) {
      await Promise.all(
        request.items.map((it) =>
          inventoryService.unreserve(it.inventoryItemId, it.quantity),
        ),
      );
    }
    if (status === "released" && prev !== "released") {
      await Promise.all(
        request.items.map((it) =>
          inventoryService.release(it.inventoryItemId, it.quantity),
        ),
      );
    }

    request.status = status;
    request.updatedAt = new Date().toISOString();
    return delay(clone(request));
  },
};
