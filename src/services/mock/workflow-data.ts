import type { Workflow, WorkflowStage, WorkflowTone } from "@/types";

/**
 * Seed workflow definitions — one active workflow per workflow-enabled module.
 * The Kanban and every workflow visualization generate purely from these stages,
 * so administrators can add / remove / rename / reorder stages and the UI adapts
 * with no code changes.
 *
 * Note: Work Items intentionally do NOT use the Workflow Engine (they use fixed
 * statuses — see features/work-items/statuses.ts), so no work-item workflow here.
 */

const stage = (
  id: string,
  name: string,
  order: number,
  tone: WorkflowTone,
  description?: string,
): WorkflowStage => ({ id, name, order, tone, description });

export const WORKFLOWS: Workflow[] = [
  {
    id: 1,
    name: "Job Order Workflow",
    description: "End-to-end lifecycle for equipment repair and service job orders.",
    moduleId: "job-orders",
    moduleLabel: "Job Orders",
    status: "active",
    updatedBy: "Christian Cua",
    updatedAt: "2026-06-28T08:30:00Z",
    stages: [
      stage("jo-draft", "Draft", 1, "slate", "Logged, not yet submitted."),
      stage("jo-submitted", "Submitted", 2, "blue", "Submitted for approval."),
      stage("jo-approved", "Approved", 3, "violet", "Approved to proceed."),
      stage("jo-assigned", "Assigned", 4, "blue", "Assigned to a technician."),
      stage("jo-diagnosing", "Diagnosing", 5, "amber", "Fault diagnosis underway."),
      stage("jo-waiting-parts", "Waiting for Parts", 6, "orange", "Awaiting parts."),
      stage("jo-repair", "Repair", 7, "amber", "Repair in progress."),
      stage("jo-quality-check", "Quality Check", 8, "violet", "QA and sign-off."),
      stage("jo-completed", "Completed", 9, "green", "Work completed."),
      stage("jo-closed", "Closed", 10, "slate", "Closed and archived."),
    ],
    transitions: [
      { id: "jt1", fromStageId: "jo-draft", toStageId: "jo-submitted" },
      { id: "jt2", fromStageId: "jo-submitted", toStageId: "jo-approved", approverRoles: ["Service Manager"] },
      { id: "jt3", fromStageId: "jo-approved", toStageId: "jo-assigned" },
      { id: "jt4", fromStageId: "jo-assigned", toStageId: "jo-diagnosing" },
      { id: "jt5", fromStageId: "jo-diagnosing", toStageId: "jo-waiting-parts", conditions: [{ type: "supervisor_approval", label: "Supervisor approval recorded" }] },
      { id: "jt6", fromStageId: "jo-waiting-parts", toStageId: "jo-repair", conditions: [{ type: "parts_released", label: "Parts released from warehouse" }], approverRoles: ["Warehouse Manager"] },
      { id: "jt7", fromStageId: "jo-repair", toStageId: "jo-quality-check", conditions: [{ type: "all_work_items_completed", label: "All work items completed" }] },
      { id: "jt8", fromStageId: "jo-quality-check", toStageId: "jo-completed", conditions: [{ type: "qa_passed", label: "QA passed" }], approverRoles: ["Service Manager"] },
      { id: "jt9", fromStageId: "jo-completed", toStageId: "jo-closed" },
    ],
  },
  {
    id: 3,
    name: "Project Workflow",
    description: "Delivery lifecycle for service and installation projects.",
    moduleId: "projects",
    moduleLabel: "Projects",
    status: "active",
    updatedBy: "Angelica Torres",
    updatedAt: "2026-06-25T10:00:00Z",
    stages: [
      stage("pr-planning", "Planning", 1, "blue", "Scope, schedule, and resourcing."),
      stage("pr-execution", "Execution", 2, "amber", "Active delivery."),
      stage("pr-monitoring", "Monitoring", 3, "violet", "Tracking progress and risks."),
      stage("pr-completed", "Completed", 4, "green", "Delivered and closed out."),
    ],
  },
  {
    id: 4,
    name: "Maintenance Workflow",
    description: "Preventive maintenance schedule for the equipment fleet.",
    moduleId: "maintenance",
    moduleLabel: "Maintenance",
    status: "active",
    updatedBy: "Carlos Aquino",
    updatedAt: "2026-06-29T09:45:00Z",
    stages: [
      stage("mt-scheduled", "Scheduled", 1, "slate", "Booked on the calendar."),
      stage("mt-assigned", "Assigned", 2, "blue", "Technician assigned."),
      stage("mt-maintenance", "Maintenance", 3, "amber", "Service in progress."),
      stage("mt-inspection", "Inspection", 4, "violet", "Post-service inspection."),
      stage("mt-completed", "Completed", 5, "green", "Signed off and returned to service."),
    ],
  },
];
