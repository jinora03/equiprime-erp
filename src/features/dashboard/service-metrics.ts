import type { ApprovalTask } from "@/types";
import type { JobOrder } from "@/features/job-orders/types";
import type { PartsRequest } from "@/features/parts/types";
import type { WorkItem } from "@/features/work-items/types";
import { elapsedMs, MS_PER_DAY, MS_PER_HOUR } from "@/utils/duration";

/**
 * Service dashboard domain logic: metrics + bottleneck detection over real Job
 * Order, Parts Request (Shot 4), and Work Item data. Centralized and pure so
 * the same records always yield the same numbers, and thresholds live in ONE
 * place — a stand-in for client-defined SLA rules later.
 */

const CLOSED_STAGES: readonly string[] = ["jo-completed", "jo-closed"];
const WAITING_PARTS_STAGE = "jo-waiting-parts";
const COMPLETED_STAGE = "jo-completed";

export const isActiveJobOrder = (job: Pick<JobOrder, "currentStageId">): boolean =>
  !CLOSED_STAGES.includes(job.currentStageId);

/**
 * Bottleneck / SLA thresholds. Intentionally simple, centralized defaults —
 * change them here (or later load from client config) and every metric and
 * alert updates consistently. Not a full SLA engine by design.
 */
export const SERVICE_THRESHOLDS = {
  /** Approval request left pending longer than this (hours) is flagged. */
  approvalWaitHours: 12,
  /** Active job order with no history/update for longer than this (hours). */
  noActivityHours: 24,
  /** Job order sitting in "Waiting for Parts" longer than this (hours). */
  waitingPartsHours: 24,
  /** Active job order due within this many days is flagged as "due soon". */
  dueSoonDays: 2,
  /** Window (days) for the "completed recently" metric. */
  completedWindowDays: 7,
} as const;

export interface ServiceMetrics {
  activeJobOrders: number;
  awaitingParts: number;
  pendingPartsRequests: number;
  overdueJobOrders: number;
  overdueWorkItems: number;
  completedRecently: number;
}

export type BottleneckKind =
  | "parts_approval_wait"
  | "workflow_approval_wait"
  | "waiting_parts"
  | "no_activity"
  | "work_item_overdue"
  | "job_order_overdue"
  | "due_soon";

export type BottleneckSeverity = "critical" | "warning";

export interface Bottleneck {
  id: string;
  jobOrderId: number;
  code: string;
  title: string;
  kind: BottleneckKind;
  /** Why this needs attention, e.g. "Waiting for parts approval". */
  reason: string;
  /** Supporting context, e.g. "Assigned: Jun Bautista" or "Due 2026-07-01". */
  detail?: string;
  /** Span the alert is measured over (ms); 0 for non-time-based alerts. */
  elapsedMs: number;
  severity: BottleneckSeverity;
}

interface DeriveInput {
  jobOrders: JobOrder[];
  partsRequests: PartsRequest[];
  workItems: WorkItem[];
  approvalTasks?: ApprovalTask[];
  /** Injectable "now" for deterministic behaviour/testing. Defaults to now. */
  now?: string | number | Date;
}

const isoDay = (value: string | number | Date): string =>
  new Date(value).toISOString().slice(0, 10);

/** Latest moment anything happened on a job order (history, else creation). */
function lastActivityAt(job: JobOrder): string {
  return job.history.reduce<string>(
    (latest, entry) => (entry.at > latest ? entry.at : latest),
    job.createdAt,
  );
}

/** When the job order entered its current stage (latest transition into it). */
function enteredCurrentStageAt(job: JobOrder): string {
  const entry = [...job.history]
    .reverse()
    .find((h) => h.toStageId === job.currentStageId);
  return entry?.at ?? job.createdAt;
}

function approvalOwner(task: ApprovalTask): string {
  const people = (task.approverAssignments ?? []).flatMap((assignment) =>
    assignment.people.map((person) => `${assignment.role} · ${person.name}`),
  );
  return people.length > 0
    ? `Pending with ${people.join(", ")}`
    : `Pending with ${task.requiredRoles.join(", ")}`;
}

export function deriveServiceMetrics(input: DeriveInput): ServiceMetrics {
  const now = input.now ?? Date.now();
  const today = isoDay(now);
  const active = input.jobOrders.filter(isActiveJobOrder);
  const completedCutoff =
    new Date(now).getTime() -
    SERVICE_THRESHOLDS.completedWindowDays * MS_PER_DAY;

  return {
    activeJobOrders: active.length,
    awaitingParts: active.filter(
      (job) => job.currentStageId === WAITING_PARTS_STAGE,
    ).length,
    pendingPartsRequests: input.partsRequests.filter(
      (request) => request.status === "pending",
    ).length,
    overdueJobOrders: active.filter(
      (job) => Boolean(job.dueDate) && job.dueDate < today,
    ).length,
    overdueWorkItems: input.workItems.filter(
      (item) =>
        item.status !== "completed" &&
        Boolean(item.dueDate) &&
        item.dueDate < today,
    ).length,
    completedRecently: input.jobOrders.filter(
      (job) =>
        job.currentStageId === COMPLETED_STAGE &&
        new Date(job.updatedAt).getTime() >= completedCutoff,
    ).length,
  };
}

/**
 * Identify operational bottlenecks with a concrete reason + elapsed context.
 * Sorted critical-first, then longest-waiting. Callers may cap the list length.
 */
export function detectBottlenecks(input: DeriveInput): Bottleneck[] {
  const now = input.now ?? Date.now();
  const today = isoDay(now);
  const dueSoonCutoff = isoDay(
    new Date(now).getTime() + SERVICE_THRESHOLDS.dueSoonDays * MS_PER_DAY,
  );
  const jobById = new Map(input.jobOrders.map((job) => [job.id, job]));
  const partRequestById = new Map(
    input.partsRequests.map((request) => [request.id, request]),
  );
  const out: Bottleneck[] = [];

  // 1. Approval queues: surface both the business blocker and the actual role/
  // person expected to act. Dashboard reads this across the active branch; it
  // does not grant the viewer approval authority.
  const representedPartApprovals = new Set<number>();
  for (const task of input.approvalTasks ?? []) {
    if (task.status !== "pending") continue;
    const waited = elapsedMs(task.requestedAt, now);
    if (waited < SERVICE_THRESHOLDS.approvalWaitHours * MS_PER_HOUR) continue;

    let jobOrderId: number | null = null;
    if (task.kind === "parts_request") {
      representedPartApprovals.add(task.recordId);
      jobOrderId = partRequestById.get(task.recordId)?.jobOrderId ?? null;
    } else if (task.moduleId === "job-orders") {
      jobOrderId = task.recordId;
    }
    if (jobOrderId == null) continue;

    const job = jobById.get(jobOrderId);
    out.push({
      id: `approval-wait-${task.id}`,
      jobOrderId,
      code: job?.code ?? task.recordCode,
      title: job?.title ?? task.recordTitle,
      kind:
        task.kind === "parts_request"
          ? "parts_approval_wait"
          : "workflow_approval_wait",
      reason:
        task.kind === "parts_request"
          ? "Parts approval pending"
          : "Approval pending",
      detail: approvalOwner(task),
      elapsedMs: waited,
      severity: "critical",
    });
  }

  // Fallback for callers that do not provide approval read models yet.
  for (const request of input.partsRequests) {
    if (request.status !== "pending" || representedPartApprovals.has(request.id)) {
      continue;
    }
    const waited = elapsedMs(request.createdAt, now);
    if (waited < SERVICE_THRESHOLDS.approvalWaitHours * MS_PER_HOUR) continue;
    const job = jobById.get(request.jobOrderId);
    out.push({
      id: `parts-wait-${request.id}`,
      jobOrderId: request.jobOrderId,
      code: job?.code ?? request.code,
      title: job?.title ?? "Parts request",
      kind: "parts_approval_wait",
      reason: "Parts approval pending",
      detail: `Requested by ${request.requestedBy}`,
      elapsedMs: waited,
      severity: "critical",
    });
  }

  for (const job of input.jobOrders) {
    if (!isActiveJobOrder(job)) continue;

    // 2. Stuck in the "Waiting for Parts" stage too long.
    if (job.currentStageId === WAITING_PARTS_STAGE) {
      const waited = elapsedMs(enteredCurrentStageAt(job), now);
      if (waited >= SERVICE_THRESHOLDS.waitingPartsHours * MS_PER_HOUR) {
        out.push({
          id: `waiting-parts-${job.id}`,
          jobOrderId: job.id,
          code: job.code,
          title: job.title,
          kind: "waiting_parts",
          reason: "Stuck waiting for parts",
          detail: job.assignee ? `Mechanic: ${job.assignee}` : undefined,
          elapsedMs: waited,
          severity: "warning",
        });
      }
    }

    // 3. No activity for too long.
    const idle = elapsedMs(lastActivityAt(job), now);
    if (idle >= SERVICE_THRESHOLDS.noActivityHours * MS_PER_HOUR) {
      out.push({
        id: `no-activity-${job.id}`,
        jobOrderId: job.id,
        code: job.code,
        title: job.title,
        kind: "no_activity",
        reason: "No recent activity",
        detail: job.assignee ? `Mechanic: ${job.assignee}` : undefined,
        elapsedMs: idle,
        severity: "warning",
      });
    }

    // 4. Past due date, or approaching it.
    if (Boolean(job.dueDate) && job.dueDate < today) {
      out.push({
        id: `overdue-${job.id}`,
        jobOrderId: job.id,
        code: job.code,
        title: job.title,
        kind: "job_order_overdue",
        reason: "Past due date",
        detail: `Due ${job.dueDate}`,
        elapsedMs: 0,
        severity: "critical",
      });
    } else if (Boolean(job.dueDate) && job.dueDate <= dueSoonCutoff) {
      out.push({
        id: `due-soon-${job.id}`,
        jobOrderId: job.id,
        code: job.code,
        title: job.title,
        kind: "due_soon",
        reason: "Due soon",
        detail: `Due ${job.dueDate}`,
        elapsedMs: 0,
        severity: "warning",
      });
    }
  }

  // 5. Overdue work items (surfaced against their job order).
  for (const item of input.workItems) {
    if (item.status === "completed") continue;
    if (!item.dueDate || item.dueDate >= today) continue;
    out.push({
      id: `work-item-${item.id}`,
      jobOrderId: item.jobOrderId,
      code: item.jobOrderCode,
      title: item.task,
      kind: "work_item_overdue",
      reason: "Work item overdue",
      detail: item.assignee ? `Mechanic: ${item.assignee}` : undefined,
      elapsedMs: 0,
      severity: "warning",
    });
  }

  const severityRank: Record<BottleneckSeverity, number> = {
    critical: 0,
    warning: 1,
  };
  const sorted = out.sort((a, b) => {
    if (severityRank[a.severity] !== severityRank[b.severity]) {
      return severityRank[a.severity] - severityRank[b.severity];
    }
    return b.elapsedMs - a.elapsedMs;
  });

  // One row per job order — after sorting, the first entry is its most
  // important reason, so the list stays actionable instead of repeating a job.
  const seen = new Set<number>();
  return sorted.filter((bottleneck) => {
    if (seen.has(bottleneck.jobOrderId)) return false;
    seen.add(bottleneck.jobOrderId);
    return true;
  });
}
