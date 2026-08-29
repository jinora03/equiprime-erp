import type { PartsRequest } from "./types";

/**
 * A waiting-for-parts cycle is satisfied only by requests created for that
 * specific cycle. Rejected requests are not outstanding requirements; at least
 * one non-rejected request must exist and every such request must be released.
 */
export function arePartsReleasedForCycle(
  requests: readonly PartsRequest[],
  cycle: number,
): boolean {
  if (cycle <= 0) return false;
  const required = requests.filter(
    (request) =>
      request.jobOrderPartsCycle === cycle && request.status !== "rejected",
  );
  return (
    required.length > 0 &&
    required.every((request) => request.status === "released")
  );
}
