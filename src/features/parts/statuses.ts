import type { WorkflowTone } from "@/types";
import type { PartsRequestStatus } from "./types";

/** Parts request status config (data-driven chips, not hardcoded in the UI). */
export const PARTS_REQUEST_STATUSES: {
  id: PartsRequestStatus;
  label: string;
  tone: WorkflowTone;
}[] = [
  { id: "draft", label: "Draft", tone: "slate" },
  { id: "pending", label: "Pending", tone: "amber" },
  { id: "approved", label: "Approved", tone: "blue" },
  { id: "rejected", label: "Rejected", tone: "red" },
  { id: "released", label: "Released", tone: "green" },
];

export const getPartsRequestStatus = (id: PartsRequestStatus) =>
  PARTS_REQUEST_STATUSES.find((s) => s.id === id) ?? PARTS_REQUEST_STATUSES[0];
