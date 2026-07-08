import type { WorkItem } from "./types";

/**
 * Seed work items. Each belongs to a job order and carries a fixed status.
 * The "Repair Excavator" example (JO-2026-0105) matches the spec walkthrough.
 */
export const workItemSeed: WorkItem[] = [
  // Repair Excavator (JO-2026-0105)
  { id: 1, code: "WI-2026-0001", task: "Inspect Engine", jobOrderId: 1, jobOrderCode: "JO-2026-0105", assignee: "Jun Bautista", priority: "High", estimatedHours: 4, actualHours: 4, dueDate: "2026-06-26", status: "completed", notes: "Compression within spec.", createdAt: "2026-06-24T08:30:00Z", updatedAt: "2026-06-26T12:00:00Z" },
  { id: 2, code: "WI-2026-0002", task: "Replace Hydraulic Pump", jobOrderId: 1, jobOrderCode: "JO-2026-0105", assignee: "Jun Bautista", priority: "High", estimatedHours: 6, actualHours: 2, dueDate: "2026-06-30", status: "in_progress", notes: "Awaiting replacement pump.", createdAt: "2026-06-25T09:00:00Z", updatedAt: "2026-06-27T09:00:00Z" },
  { id: 3, code: "WI-2026-0003", task: "Pressure Test", jobOrderId: 1, jobOrderCode: "JO-2026-0105", assignee: "Rafael Mercado", priority: "High", estimatedHours: 2, actualHours: 0, dueDate: "2026-07-01", status: "not_started", notes: "", createdAt: "2026-06-26T09:00:00Z", updatedAt: "2026-06-26T09:00:00Z" },
  { id: 4, code: "WI-2026-0004", task: "Final Inspection", jobOrderId: 1, jobOrderCode: "JO-2026-0105", assignee: "Carlos Aquino", priority: "Medium", estimatedHours: 2, actualHours: 0, dueDate: "2026-07-03", status: "not_started", notes: "", createdAt: "2026-06-26T09:15:00Z", updatedAt: "2026-06-26T09:15:00Z" },
  // Hydraulic Pump Replacement (JO-2026-0103) — completed job
  { id: 5, code: "WI-2026-0005", task: "Remove Old Pump", jobOrderId: 3, jobOrderCode: "JO-2026-0103", assignee: "Jun Bautista", priority: "High", estimatedHours: 5, actualHours: 5, dueDate: "2026-06-22", status: "completed", notes: "", createdAt: "2026-06-20T08:00:00Z", updatedAt: "2026-06-22T15:00:00Z" },
  { id: 6, code: "WI-2026-0006", task: "Install New Pump", jobOrderId: 3, jobOrderCode: "JO-2026-0103", assignee: "Jun Bautista", priority: "High", estimatedHours: 6, actualHours: 6.5, dueDate: "2026-06-24", status: "completed", notes: "Torqued to spec.", createdAt: "2026-06-21T08:00:00Z", updatedAt: "2026-06-24T16:00:00Z" },
  // Bucket Reconditioning (JO-2026-0101)
  { id: 7, code: "WI-2026-0007", task: "Weld Bucket Edges", jobOrderId: 5, jobOrderCode: "JO-2026-0101", assignee: "Rafael Mercado", priority: "Medium", estimatedHours: 8, actualHours: 7, dueDate: "2026-06-26", status: "in_progress", notes: "", createdAt: "2026-06-23T08:00:00Z", updatedAt: "2026-06-26T10:00:00Z" },
  // Transmission Repair (JO-2026-0104)
  { id: 8, code: "WI-2026-0008", task: "Diagnose Transmission", jobOrderId: 2, jobOrderCode: "JO-2026-0104", assignee: "Rafael Mercado", priority: "Medium", estimatedHours: 3, actualHours: 2, dueDate: "2026-06-27", status: "in_progress", notes: "Suspected clutch pack wear.", createdAt: "2026-06-25T10:00:00Z", updatedAt: "2026-06-26T14:00:00Z" },
];
