import { delay } from "@/services/mock/delay";

import { jobOrderAttachmentSeed, jobOrderLaborSeed } from "./detail-data";
import type { JobOrderAttachment, JobOrderLabor } from "./types";

const cloneLabor = (item: JobOrderLabor): JobOrderLabor => ({ ...item });
const cloneAttachment = (item: JobOrderAttachment): JobOrderAttachment => ({
  ...item,
});

export const jobOrderDetailService = {
  /** jobOrderId is intentionally part of the contract for the future API. */
  listLabor(jobOrderId: number): Promise<JobOrderLabor[]> {
    if (!Number.isFinite(jobOrderId)) return Promise.resolve([]);
    return delay(jobOrderLaborSeed.map(cloneLabor));
  },

  /** jobOrderId is intentionally part of the contract for the future API. */
  listAttachments(jobOrderId: number): Promise<JobOrderAttachment[]> {
    if (!Number.isFinite(jobOrderId)) return Promise.resolve([]);
    return delay(jobOrderAttachmentSeed.map(cloneAttachment));
  },
};
