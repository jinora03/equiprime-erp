import { jobOrderService } from "@/features/job-orders/service";
import type { JobOrder } from "@/features/job-orders/types";
import { workItemService } from "@/features/work-items/service";
import type { WorkItem } from "@/features/work-items/types";
import type { ServiceWorkActor } from "@/services/service-work-access";
import type { OrganizationScope } from "@/types";

export interface MyWorkSnapshot {
  jobOrders: JobOrder[];
  workItems: WorkItem[];
}

const JOB_ORDER_DONE_STAGES = new Set(["jo-completed", "jo-closed"]);

/**
 * Personal work queue projected from the existing Job Order and Work Item
 * repositories. It owns no duplicate business state.
 */
export const myWorkService = {
  async get(
    actor: ServiceWorkActor,
    scope: OrganizationScope,
  ): Promise<MyWorkSnapshot> {
    const [visibleJobOrders, assignedWorkItems] = await Promise.all([
      jobOrderService.listForActor(actor, scope),
      workItemService.listAssignedTo(actor.userId, scope),
    ]);

    const jobOrders = visibleJobOrders.filter(
      (jobOrder) =>
        jobOrder.assigneeIds.includes(actor.userId) &&
        !JOB_ORDER_DONE_STAGES.has(jobOrder.currentStageId),
    );
    const activeJobIds = new Set(jobOrders.map((jobOrder) => jobOrder.id));
    const workItems = assignedWorkItems.filter(
      (workItem) =>
        workItem.status !== "completed" &&
        activeJobIds.has(workItem.jobOrderId),
    );

    return { jobOrders, workItems };
  },
};
