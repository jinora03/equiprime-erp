import { WILDCARD } from "@/constants/modules";
import { delay } from "@/services/mock/delay";
import {
  applyRegisteredApprovedMove,
  findRegisteredWorkflowRecord,
  validateRegisteredApprovalRequest,
} from "@/services/workflow-record-registry";
import { workflowService } from "@/services/workflow.service";
import type {
  ApprovalActor,
  ApprovalDecision,
  ApprovalDecisionInput,
  ApprovalRequestInput,
  ApprovalStatus,
  ApprovalTask,
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

const actorCanSeeTask = (task: ApprovalTaskEntity, actor: ApprovalActor) =>
  isSuperAdmin(actor) || task.requiredRoles.includes(actor.role);

async function workflowForRecord(
  task: Pick<ApprovalTaskEntity, "workflowId" | "moduleId">,
): Promise<Workflow> {
  if (task.workflowId) return workflowService.get(task.workflowId);
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

async function enrich(task: ApprovalTaskEntity): Promise<ApprovalTask> {
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

function inScope(task: ApprovalTaskEntity, scope: OrganizationScope) {
  return task.companyId === scope.companyId && task.branchId === scope.branchId;
}

function assertCanAct(actor: ApprovalActor) {
  if (!hasPermission(actor.permissions, "approvals:act")) {
    throw new Error("You don't have permission to act on approvals.");
  }
}

export const approvalService = {
  async listForActor(
    scope: OrganizationScope,
    actor: ApprovalActor,
  ): Promise<ApprovalTask[]> {
    if (!hasPermission(actor.permissions, "approvals:view")) return [];
    const relevant = tasks.filter(
      (task) => inScope(task, scope) && actorCanSeeTask(task, actor),
    );
    return delay(await Promise.all(relevant.map(enrich)));
  },

  async request(input: ApprovalRequestInput): Promise<ApprovalTask> {
    const evaluation = await validateRegisteredApprovalRequest(
      input.moduleId,
      input.recordId,
      input.toStageId,
      {
        actorRole: input.actor.role,
        permissions: input.actor.permissions,
        confirmedConditions: input.confirmedConditions,
      },
    );
    if (!evaluation.allowed || !evaluation.transition) {
      throw new Error(evaluation.reason ?? "This approval request is not allowed.");
    }

    const record = findRegisteredWorkflowRecord(input.moduleId, input.recordId);
    if (!record) throw new Error("Record not found.");
    const recordWorkflowId = (record as WorkflowRecord & { workflowId?: number }).workflowId;
    const workflow = recordWorkflowId
      ? await workflowService.get(recordWorkflowId)
      : await workflowService.getByModule(input.moduleId);
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
    if (existing) return enrich(existing);

    seq += 1;
    const task: ApprovalTaskEntity = {
      id: `approval-${String(seq).padStart(3, "0")}`,
      companyId: record.companyId,
      branchId: record.branchId,
      workflowId: workflow.id,
      moduleId: input.moduleId,
      recordId: input.recordId,
      transitionId: input.transitionId,
      requiredRoles: [...evaluation.approverRoles],
      confirmedConditions: [...(input.confirmedConditions ?? [])],
      requestedById: input.actor.id,
      requestedByName: input.actor.name,
      requestedByRole: input.actor.role,
      requestedAt: new Date().toISOString(),
      status: "pending",
      decisions: [],
    };
    tasks.unshift(task);
    return delay(await enrich(task));
  },

  async decide(input: ApprovalDecisionInput): Promise<ApprovalTask> {
    assertCanAct(input.actor);
    const task = tasks.find((candidate) => candidate.id === input.taskId);
    if (!task) throw new Error("Approval task not found.");
    if (task.status !== "pending") throw new Error("This approval is already resolved.");
    if (!actorCanSeeTask(task, input.actor)) {
      throw new Error("This approval is assigned to a different role.");
    }

    const now = new Date().toISOString();
    const role = isSuperAdmin(input.actor)
      ? task.requiredRoles.find(
          (requiredRole) =>
            !task.decisions.some((decision) => decision.role === requiredRole),
        )
      : task.requiredRoles.find((requiredRole) => requiredRole === input.actor.role);
    if (!role) throw new Error("Your role has already approved this request.");

    const decision: ApprovalDecision = {
      role,
      actorId: input.actor.id,
      actorName: input.actor.name,
      actorRole: input.actor.role,
      at: now,
      note: input.note?.trim() || undefined,
    };

    if (input.decision === "reject") {
      if (!input.note?.trim()) throw new Error("Add a reason before rejecting.");
      task.status = "rejected";
      task.rejectedBy = decision;
      task.resolvedAt = now;
      return delay(await enrich(task));
    }

    const nextDecisions = [...task.decisions, decision];
    const approvedRoles = new Set(nextDecisions.map((item) => item.role));
    const fullyApproved = task.requiredRoles.every((requiredRole) =>
      approvedRoles.has(requiredRole),
    );

    if (fullyApproved) {
      const enriched = await enrich(task);
      await applyRegisteredApprovedMove(
        task.moduleId,
        task.recordId,
        enriched.toStageId,
        {
          actor: input.actor.name,
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
    } else {
      task.decisions = nextDecisions;
    }

    return delay(await enrich(task));
  },
};
