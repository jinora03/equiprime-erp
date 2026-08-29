import { WILDCARD } from "@/constants/modules";
import { PARTS_APPROVER_ROLES, partsRequestService } from "@/features/parts/service";
import {
  applyRegisteredApprovedMove,
  findRegisteredWorkflowRecord,
  validateRegisteredApprovalRequest,
} from "@/services/workflow-record-registry";
import { requireMockSessionActor } from "@/services/mock/session-context";
import { userService } from "@/services/user.service";
import { workflowService } from "@/services/workflow.service";
import type {
  ApprovalActor,
  ApprovalApproverAssignment,
  ApprovalDecision,
  CreateApprovalRequest,
  DecideApprovalRequest,
  ApprovalStatus,
  ApprovalTask,
  ApprovalTaskResponse,
  OrganizationScope,
  TransitionConditionType,
  Workflow,
  WorkflowRecord,
} from "@/types";
import { hasPermission } from "@/utils/rbac";
import { approvalTaskSeed } from "./data";

interface ApprovalTaskEntity {
  id: string;
  companyId: string;
  branchId: string;
  workflowId: number;
  workflowVersion: number;
  moduleId: string;
  recordId: number;
  transitionId: string;
  requiredRoles: string[];
  confirmedConditions: TransitionConditionType[];
  requestedById: number;
  requestedByName: string;
  requestedByRole: string;
  requestedAt: string;
  status: ApprovalStatus;
  decisions: ApprovalDecision[];
  rejectedBy?: ApprovalDecision;
  resolvedAt?: string;
}

const tasks: ApprovalTaskEntity[] = approvalTaskSeed.map((task) => ({
  ...task,
  requiredRoles: [...task.requiredRoles],
  confirmedConditions: [...task.confirmedConditions],
  status: "pending",
  decisions: [],
}));
let seq = tasks.length;

const isSuperAdmin = (actor: ApprovalActor) =>
  actor.permissions.includes(WILDCARD);

const actorCanSeeRoles = (requiredRoles: readonly string[], actor: ApprovalActor) =>
  isSuperAdmin(actor) || requiredRoles.includes(actor.role);

async function workflowForRecord(
  task: Pick<ApprovalTaskEntity, "workflowId" | "workflowVersion" | "moduleId">,
): Promise<Workflow> {
  if (task.workflowId) return workflowService.get(task.workflowId, task.workflowVersion);
  const workflow = await workflowService.getByModule(task.moduleId);
  if (!workflow) throw new Error("Workflow not found for approval task.");
  return workflow;
}

function contextForRecord(record: WorkflowRecord): ApprovalTask["context"] {
  const context: ApprovalTask["context"] = [];
  if (record.assignee) context.push({ label: "Assigned", value: record.assignee });

  if (record.moduleId === "job-orders") {
    const job = record as WorkflowRecord & {
      customer?: string;
      equipment?: string;
      priority?: string;
      dueDate?: string;
    };
    if (job.customer) context.unshift({ label: "Customer", value: job.customer });
    if (job.equipment) context.push({ label: "Equipment", value: job.equipment });
    if (job.priority) context.push({ label: "Priority", value: job.priority });
    if (job.dueDate) context.push({ label: "Due date", value: job.dueDate });
  }
  return context;
}

async function enrichWorkflow(task: ApprovalTaskEntity): Promise<ApprovalTaskResponse> {
  const record = findRegisteredWorkflowRecord(task.moduleId, task.recordId);
  if (!record) throw new Error("The record for this approval no longer exists.");
  const workflow = await workflowForRecord(task);
  const transition = (workflow.transitions ?? []).find(
    (candidate) => candidate.id === task.transitionId,
  );
  if (!transition) throw new Error("The configured approval transition no longer exists.");

  const fromStage = workflow.stages.find((stage) => stage.id === transition.fromStageId);
  const toStage = workflow.stages.find((stage) => stage.id === transition.toStageId);

  // A request is no longer actionable if the record has already left the
  // transition's source stage through another valid path. Keep it in history
  // rather than presenting a stale approval.
  if (task.status === "pending" && record.currentStageId !== transition.fromStageId) {
    task.status = "cancelled";
    task.resolvedAt = new Date().toISOString();
  }

  return {
    ...task,
    kind: "workflow_transition",
    requiredRoles: [...task.requiredRoles],
    confirmedConditions: [...task.confirmedConditions],
    decisions: task.decisions.map((decision) => ({ ...decision })),
    rejectedBy: task.rejectedBy ? { ...task.rejectedBy } : undefined,
    moduleLabel: workflow.moduleLabel,
    recordCode: record.code,
    recordTitle: record.title,
    transitionLabel: transition.label ?? toStage?.name ?? "Workflow transition",
    fromStageId: transition.fromStageId,
    fromStageName: fromStage?.name ?? transition.fromStageId,
    toStageId: transition.toStageId,
    toStageName: toStage?.name ?? transition.toStageId,
    context: contextForRecord(record),
  };
}

async function enrichPartsRequest(
  request: Awaited<ReturnType<typeof partsRequestService.listForApproval>>[number],
): Promise<ApprovalTaskResponse> {
  const job = findRegisteredWorkflowRecord("job-orders", request.jobOrderId);
  const decision = request.decision
    ? [{
        role: request.decision.approvalRole,
        actorId: request.decision.actorId,
        actorName: request.decision.actorName,
        actorRole: request.decision.actorRole,
        at: request.decision.at,
        note: request.decision.note,
      }]
    : [];
  const status: ApprovalStatus =
    request.status === "rejected"
      ? "rejected"
      : request.status === "pending"
        ? "pending"
        : "approved";
  const itemSummary = request.items
    .map((item) => `${item.name} ×${item.quantity} ${item.unit}`)
    .join("; ");

  return {
    id: `parts:${request.id}`,
    kind: "parts_request",
    companyId: request.companyId,
    branchId: request.branchId,
    workflowId: 0,
    workflowVersion: 0,
    moduleId: "parts-requests",
    moduleLabel: "Parts Request",
    recordId: request.id,
    recordCode: request.code,
    recordTitle: job ? `Parts for ${job.code} · ${job.title}` : "Parts request",
    transitionId: "parts-approval",
    transitionLabel: "Approve & release parts",
    fromStageId: "pending",
    fromStageName: "Pending",
    toStageId: "released",
    toStageName: "Released",
    requiredRoles: [...PARTS_APPROVER_ROLES],
    confirmedConditions: [],
    context: [
      ...(job ? [{ label: "Job order", value: `${job.code} · ${job.title}` }] : []),
      { label: "Requested parts", value: itemSummary },
      ...(job?.assignee ? [{ label: "Assigned", value: job.assignee }] : []),
    ],
    requestedById: request.requestedById,
    requestedByName: request.requestedBy,
    requestedByRole: request.requestedByRole,
    requestedAt: request.createdAt,
    status,
    decisions: decision,
    rejectedBy: status === "rejected" && decision[0] ? decision[0] : undefined,
    resolvedAt: status === "pending" ? undefined : request.updatedAt,
  };
}

async function decidePartsRequest(
  taskId: string,
  input: DecideApprovalRequest,
  actor: ApprovalActor,
): Promise<ApprovalTaskResponse> {
  const requestId = Number(taskId.slice("parts:".length));
  if (!Number.isInteger(requestId)) throw new Error("Parts approval task is invalid.");
  const request = partsRequestService.get(requestId);
  if (!request) throw new Error("Parts request not found.");
  if (!actorCanSeeRoles(PARTS_APPROVER_ROLES, actor)) {
    throw new Error("This approval is assigned to a different role.");
  }
  const approvalRole = isSuperAdmin(actor)
    ? PARTS_APPROVER_ROLES[0]
    : actor.role;
  await partsRequestService.decide(
    requestId,
    input.decision,
    actor,
    approvalRole,
    input.note,
  );
  const updated = partsRequestService.get(requestId);
  if (!updated) throw new Error("Parts request not found after approval.");
  return enrichPartsRequest(updated);
}

function inScope(task: ApprovalTaskEntity, scope: OrganizationScope) {
  return task.companyId === scope.companyId && task.branchId === scope.branchId;
}

function assertCanAct(actor: ApprovalActor) {
  if (!hasPermission(actor.permissions, "approvals:act")) {
    throw new Error("You don't have permission to act on approvals.");
  }
}

async function attachApproverAssignments(
  approvalTasks: ApprovalTaskResponse[],
  scope: OrganizationScope,
): Promise<ApprovalTaskResponse[]> {
  if (approvalTasks.length === 0) return approvalTasks;

  const activeUsers = await userService.list(
    { status: "active", page: 1, page_size: 100 },
    scope,
  );
  const peopleByRole = new Map<string, ApprovalApproverAssignment["people"]>();

  for (const user of activeUsers.items) {
    const people = peopleByRole.get(user.role) ?? [];
    people.push({ id: user.id, name: user.full_name, jobTitle: user.job_title });
    peopleByRole.set(user.role, people);
  }

  return approvalTasks.map((task) => ({
    ...task,
    approverAssignments: task.requiredRoles.map((role) => ({
      role,
      people: (peopleByRole.get(role) ?? []).map((person) => ({ ...person })),
    })),
  }));
}

async function listAllInScope(scope: OrganizationScope): Promise<ApprovalTaskResponse[]> {
  const workflowTasks = await Promise.all(
    tasks.filter((task) => inScope(task, scope)).map(enrichWorkflow),
  );
  const partsRequests = await partsRequestService.listForApproval(scope);
  const partsTasks = await Promise.all(partsRequests.map(enrichPartsRequest));
  return [...workflowTasks, ...partsTasks].sort((a, b) =>
    b.requestedAt.localeCompare(a.requestedAt),
  );
}

export const approvalService = {
  async list(scope: OrganizationScope): Promise<ApprovalTaskResponse[]> {
    const actor = requireMockSessionActor();
    if (!hasPermission(actor.permissions, "approvals:view")) return [];
    const all = await listAllInScope(scope);
    const visible = all.filter((task) => actorCanSeeRoles(task.requiredRoles, actor));
    return attachApproverAssignments(visible, scope);
  },

  /**
   * Dashboard-only read model: shows who/which role is currently holding work up
   * without granting the viewer approval authority.
   */
  async listForDashboard(scope: OrganizationScope): Promise<ApprovalTaskResponse[]> {
    const actor = requireMockSessionActor();
    if (!hasPermission(actor.permissions, "dashboard:view")) return [];
    const all = await listAllInScope(scope);
    return attachApproverAssignments(
      all.filter((task) => task.status === "pending"),
      scope,
    );
  },

  async request(input: CreateApprovalRequest): Promise<ApprovalTaskResponse> {
    const actor = requireMockSessionActor();
    const evaluation = await validateRegisteredApprovalRequest(
      input.moduleId,
      input.recordId,
      input.toStageId,
      {
        actorRole: actor.role,
        permissions: actor.permissions,
        confirmedConditions: input.confirmedConditions,
      },
    );
    if (!evaluation.allowed || !evaluation.transition) {
      throw new Error(evaluation.reason ?? "This approval request is not allowed.");
    }

    const record = findRegisteredWorkflowRecord(input.moduleId, input.recordId);
    if (!record) throw new Error("Record not found.");
    const workflow = await workflowService.get(
      record.workflowId,
      record.workflowVersion,
    );
    if (!workflow) throw new Error("No active workflow is configured for this module.");
    if (evaluation.transition.id !== input.transitionId) {
      throw new Error("The requested workflow transition has changed. Refresh and try again.");
    }

    const existing = tasks.find(
      (task) =>
        task.status === "pending" &&
        task.moduleId === input.moduleId &&
        task.recordId === input.recordId &&
        task.transitionId === input.transitionId,
    );
    if (existing) return enrichWorkflow(existing);

    seq += 1;
    const task: ApprovalTaskEntity = {
      id: `approval-${String(seq).padStart(3, "0")}`,
      companyId: record.companyId,
      branchId: record.branchId,
      workflowId: workflow.id,
      workflowVersion: workflow.version,
      moduleId: input.moduleId,
      recordId: input.recordId,
      transitionId: input.transitionId,
      requiredRoles: [...evaluation.approverRoles],
      confirmedConditions: [...(input.confirmedConditions ?? [])],
      requestedById: actor.id,
      requestedByName: actor.name,
      requestedByRole: actor.role,
      requestedAt: new Date().toISOString(),
      status: "pending",
      decisions: [],
    };
    tasks.unshift(task);
    return enrichWorkflow(task);
  },

  async decide(input: DecideApprovalRequest): Promise<ApprovalTaskResponse> {
    const actor = requireMockSessionActor();
    assertCanAct(actor);
    if (input.taskId.startsWith("parts:")) {
      return decidePartsRequest(input.taskId, input, actor);
    }
    const task = tasks.find((candidate) => candidate.id === input.taskId);
    if (!task) throw new Error("Approval task not found.");
    if (task.status !== "pending") throw new Error("This approval is already resolved.");
    if (!actorCanSeeRoles(task.requiredRoles, actor)) {
      throw new Error("This approval is assigned to a different role.");
    }

    const now = new Date().toISOString();
    const role = isSuperAdmin(actor)
      ? task.requiredRoles.find(
          (requiredRole) =>
            !task.decisions.some((decision) => decision.role === requiredRole),
        )
      : task.requiredRoles.find((requiredRole) => requiredRole === actor.role);
    if (!role) throw new Error("Your role has already approved this request.");

    const decision: ApprovalDecision = {
      role,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      at: now,
      note: input.note?.trim() || undefined,
    };

    if (input.decision === "reject") {
      if (!input.note?.trim()) throw new Error("Add a reason before rejecting.");
      task.status = "rejected";
      task.rejectedBy = decision;
      task.resolvedAt = now;
      return enrichWorkflow(task);
    }

    const nextDecisions = [...task.decisions, decision];
    const approvedRoles = new Set(nextDecisions.map((item) => item.role));
    const fullyApproved = task.requiredRoles.every((requiredRole) =>
      approvedRoles.has(requiredRole),
    );

    if (fullyApproved) {
      const enriched = await enrichWorkflow(task);
      await applyRegisteredApprovedMove(
        task.moduleId,
        task.recordId,
        enriched.toStageId,
        {
          actor: actor.name,
          approvedRoles: [...approvedRoles],
          confirmedConditions: task.confirmedConditions,
          note:
            input.note?.trim() ||
            `Approved via My Approvals (${task.requiredRoles.join(", ")})`,
        },
      );
      task.decisions = nextDecisions;
      task.status = "approved";
      task.resolvedAt = now;
      return {
        ...enriched,
        status: task.status,
        decisions: task.decisions.map((decision) => ({ ...decision })),
        resolvedAt: task.resolvedAt,
      };
    }

    task.decisions = nextDecisions;
    return enrichWorkflow(task);
  },
};
