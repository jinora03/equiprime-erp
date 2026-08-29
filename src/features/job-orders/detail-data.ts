import type { JobOrderAttachment, JobOrderLabor } from "./types";

/**
 * Mock sub-records for Job Order detail tabs. UI must access these through the
 * detail service/hooks so the fixtures can later be replaced by API calls.
 */
export const jobOrderLaborSeed: JobOrderLabor[] = [
  { id: 1, mechanic: "Jun Bautista", date: "2026-06-25", hours: 6, rate: 650 },
  { id: 2, mechanic: "Rafael Mercado", date: "2026-06-26", hours: 4, rate: 650 },
  { id: 3, mechanic: "Jun Bautista", date: "2026-06-27", hours: 3.5, rate: 650 },
];

export const jobOrderAttachmentSeed: JobOrderAttachment[] = [
  {
    id: 1,
    name: "Inspection Report.pdf",
    type: "PDF",
    size: "1.2 MB",
    uploadedBy: "Jun Bautista",
    uploadedAt: "2026-06-25",
  },
  {
    id: 2,
    name: "Excavator Photo.jpg",
    type: "Image",
    size: "3.4 MB",
    uploadedBy: "Rafael Mercado",
    uploadedAt: "2026-06-25",
  },
  {
    id: 3,
    name: "Parts Quotation.xlsx",
    type: "Spreadsheet",
    size: "48 KB",
    uploadedBy: "Grace Tan",
    uploadedAt: "2026-06-26",
  },
];
