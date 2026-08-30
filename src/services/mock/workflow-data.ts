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
    version: 1,
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
      stage("jo-repair", "Repair", 4, "blue", "Repair in progress."),
      stage("jo-waiting-parts", "Waiting for Parts", 5, "orange", "Awaiting parts."),
      stage("jo-completed", "Completed", 6, "green", "Work completed."),
      stage("jo-closed", "Closed", 7, "slate", "Closed and archived."),
    ],
    transitions: [
      {
        id: "jt1",
        fromStageId: "jo-draft",
        toStageId: "jo-submitted",
        label: "Submit for approval",
      },
      {
        id: "jt2",
        fromStageId: "jo-submitted",
        toStageId: "jo-approved",
        label: "Approve",
        approverRoles: ["Manager"],
      },
      {
        id: "jt2-return",
        fromStageId: "jo-submitted",
        toStageId: "jo-draft",
        label: "Return to Draft",
      },
      {
        id: "jt3",
        fromStageId: "jo-approved",
        toStageId: "jo-repair",
        label: "Start repair",
      },
      {
        id: "jt6",
        fromStageId: "jo-waiting-parts",
        toStageId: "jo-repair",
        label: "Parts received — start repair",
        conditions: [
          {
            type: "parts_released",
            label: "Parts released from warehouse",
          },
        ],
        approverRoles: ["Warehouse Staff"],
      },
      {
        id: "jt6-more-parts",
        fromStageId: "jo-repair",
        toStageId: "jo-waiting-parts",
        label: "Request additional parts",
      },
      {
        id: "jt7",
        fromStageId: "jo-repair",
        toStageId: "jo-completed",
        label: "Complete job order",
        conditions: [
          {
            type: "all_work_items_completed",
            label: "At least one work item exists and all work items are completed",
          },
        ],
      },
      {
        id: "jt9",
        fromStageId: "jo-completed",
        toStageId: "jo-closed",
        label: "Close job order",
      },
      {
        id: "jt9-reopen",
        fromStageId: "jo-completed",
        toStageId: "jo-repair",
        label: "Reopen repair",
        approverRoles: ["Manager"],
      },
      {
        id: "jt10-reopen",
        fromStageId: "jo-closed",
        toStageId: "jo-repair",
        label: "Reopen repair",
        approverRoles: ["Manager"],
      },
    ],
  },
  {
    id: 3,
    version: 1,
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
    version: 1,
    name: "Maintenance Workflow",
    description: "Preventive maintenance schedule for the equipment fleet.",
    moduleId: "maintenance",
    moduleLabel: "Maintenance",
    status: "active",
    updatedBy: "Carlos Aquino",
    updatedAt: "2026-06-29T09:45:00Z",
    stages: [
      stage("mt-scheduled", "Scheduled", 1, "slate", "Booked on the calendar."),
      stage("mt-assigned", "Assigned", 2, "blue", "Mechanic assigned."),
      stage("mt-maintenance", "Maintenance", 3, "amber", "Service in progress."),
      stage("mt-inspection", "Inspection", 4, "violet", "Post-service inspection."),
      stage("mt-completed", "Completed", 5, "green", "Signed off and returned to service."),
    ],
  },
];
