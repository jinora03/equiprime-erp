import { jobOrderService } from "@/features/job-orders/service";
import type { JobOrder } from "@/features/job-orders/types";
import { workItemService } from "@/features/work-items/service";
import type { WorkItem } from "@/features/work-items/types";
import { requireMockSessionActor } from "@/services/mock/session-context";
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
  async get(scope: OrganizationScope): Promise<MyWorkSnapshot> {
    const actor = requireMockSessionActor();
    const [visibleJobOrders, assignedWorkItems] = await Promise.all([
      jobOrderService.listForCurrentActor(scope),
      workItemService.listAssignedTo(actor.id, scope),
    ]);

    const jobOrders = visibleJobOrders.filter(
      (jobOrder) =>
        jobOrder.assigneeIds.includes(actor.id) &&
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
