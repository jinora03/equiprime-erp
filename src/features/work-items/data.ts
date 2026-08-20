import type { WorkItem } from "./types";

/**
 * Seed work items. Each belongs to a job order and carries a fixed status.
 * The "Repair Excavator" example (JO-2026-0105) matches the spec walkthrough.
 */
export const workItemSeed: WorkItem[] = [
  // Repair Excavator (JO-2026-0105)
  { id: 1, code: "WI-2026-0001", task: "Inspect Engine", jobOrderId: 1, jobOrderCode: "JO-2026-0105", companyId: "equiprime", branchId: "main", assignee: "Jun Bautista", priority: "High", estimatedHours: 4, actualHours: 4, dueDate: "2026-06-26", status: "completed", notes: "Compression within spec.", createdAt: "2026-06-24T08:30:00Z", updatedAt: "2026-06-26T12:00:00Z" },
  { id: 2, code: "WI-2026-0002", task: "Replace Hydraulic Pump", jobOrderId: 1, jobOrderCode: "JO-2026-0105", companyId: "equiprime", branchId: "main", assignee: "Jun Bautista", priority: "High", estimatedHours: 6, actualHours: 2, dueDate: "2026-06-30", status: "in_progress", notes: "Awaiting replacement pump.", createdAt: "2026-06-25T09:00:00Z", updatedAt: "2026-06-27T09:00:00Z" },
  { id: 3, code: "WI-2026-0003", task: "Pressure Test", jobOrderId: 1, jobOrderCode: "JO-2026-0105", companyId: "equiprime", branchId: "main", assignee: "Jun Bautista", priority: "High", estimatedHours: 2, actualHours: 0, dueDate: "2026-07-01", status: "not_started", notes: "", createdAt: "2026-06-26T09:00:00Z", updatedAt: "2026-06-26T09:00:00Z" },
  { id: 4, code: "WI-2026-0004", task: "Final Inspection", jobOrderId: 1, jobOrderCode: "JO-2026-0105", companyId: "equiprime", branchId: "main", assignee: "Carlos Aquino", priority: "Medium", estimatedHours: 2, actualHours: 0, dueDate: "2026-07-03", status: "not_started", notes: "", createdAt: "2026-06-26T09:15:00Z", updatedAt: "2026-06-26T09:15:00Z" },
  // Hydraulic Pump Replacement (JO-2026-0103) — completed job
  { id: 5, code: "WI-2026-0005", task: "Remove Old Pump", jobOrderId: 3, jobOrderCode: "JO-2026-0103", companyId: "equiprime", branchId: "main", assignee: "Jun Bautista", priority: "High", estimatedHours: 5, actualHours: 5, dueDate: "2026-06-22", status: "completed", notes: "", createdAt: "2026-06-20T08:00:00Z", updatedAt: "2026-06-22T15:00:00Z" },
  { id: 6, code: "WI-2026-0006", task: "Install New Pump", jobOrderId: 3, jobOrderCode: "JO-2026-0103", companyId: "equiprime", branchId: "main", assignee: "Jun Bautista", priority: "High", estimatedHours: 6, actualHours: 6.5, dueDate: "2026-06-24", status: "completed", notes: "Torqued to spec.", createdAt: "2026-06-21T08:00:00Z", updatedAt: "2026-06-24T16:00:00Z" },
  // Bucket Reconditioning (JO-2026-0101)
  { id: 7, code: "WI-2026-0007", task: "Weld Bucket Edges", jobOrderId: 5, jobOrderCode: "JO-2026-0101", companyId: "equiprime", branchId: "main", assignee: "Jun Bautista", priority: "Medium", estimatedHours: 8, actualHours: 7, dueDate: "2026-06-26", status: "in_progress", notes: "", createdAt: "2026-06-23T08:00:00Z", updatedAt: "2026-06-26T10:00:00Z" },
  // Transmission Repair (JO-2026-0104)
  { id: 8, code: "WI-2026-0008", task: "Diagnose Transmission", jobOrderId: 2, jobOrderCode: "JO-2026-0104", companyId: "equiprime", branchId: "main", assignee: "Jun Bautista", priority: "Medium", estimatedHours: 3, actualHours: 2, dueDate: "2026-06-27", status: "in_progress", notes: "Suspected clutch pack wear.", createdAt: "2026-06-25T10:00:00Z", updatedAt: "2026-06-26T14:00:00Z" },
  // Cebu branch
  { id: 9, code: "WI-2026-0009", task: "Inspect Track Rollers", jobOrderId: 4, jobOrderCode: "JO-2026-0102", companyId: "equiprime", branchId: "cebu", assignee: "Dennis Yap", priority: "Low", estimatedHours: 3, actualHours: 0, dueDate: "2026-07-08", status: "not_started", notes: "Initial undercarriage checklist.", createdAt: "2026-06-29T08:30:00Z", updatedAt: "2026-06-29T08:30:00Z" },
  { id: 10, code: "WI-2026-0010", task: "Inspect Hoist System", jobOrderId: 6, jobOrderCode: "JO-2026-0106", companyId: "equiprime", branchId: "cebu", assignee: "Rafael Mercado", priority: "Medium", estimatedHours: 4, actualHours: 1.5, dueDate: "2026-07-05", status: "in_progress", notes: "Checking cables and limit switches.", createdAt: "2026-06-30T09:00:00Z", updatedAt: "2026-07-01T11:00:00Z" },
  // Davao branch
  { id: 11, code: "WI-2026-0011", task: "Pressure Test Hydraulic Lines", jobOrderId: 7, jobOrderCode: "JO-2026-0107", companyId: "equiprime", branchId: "davao", assignee: "Joel Manalo", priority: "High", estimatedHours: 3, actualHours: 2, dueDate: "2026-07-05", status: "in_progress", notes: "Tracing pressure loss on boom circuit.", createdAt: "2026-06-30T08:15:00Z", updatedAt: "2026-07-01T10:20:00Z" },
  { id: 12, code: "WI-2026-0012", task: "Inspect Cooling Circuit", jobOrderId: 8, jobOrderCode: "JO-2026-0108", companyId: "equiprime", branchId: "davao", assignee: "Joel Manalo", priority: "Medium", estimatedHours: 2, actualHours: 0, dueDate: "2026-07-06", status: "not_started", notes: "", createdAt: "2026-07-01T07:20:00Z", updatedAt: "2026-07-01T07:20:00Z" },
];
