/**
 * Dummy sub-records for the Job Order detail tabs (Parts / Labor / Attachments).
 * Kept as simple typed fixtures — a real API would return these per job order.
 */

export interface JobOrderPart {
  id: number;
  partNo: string;
  description: string;
  quantity: number;
  unitCost: number;
}

export interface JobOrderLabor {
  id: number;
  technician: string;
  date: string;
  hours: number;
  rate: number;
}

export interface JobOrderAttachment {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export const SAMPLE_PARTS: JobOrderPart[] = [
  { id: 1, partNo: "HYD-PMP-320", description: "Hydraulic Pump Assembly", quantity: 1, unitCost: 84500 },
  { id: 2, partNo: "FLT-OIL-88", description: "Oil Filter", quantity: 2, unitCost: 1200 },
  { id: 3, partNo: "SEAL-KIT-12", description: "Hydraulic Seal Kit", quantity: 1, unitCost: 6800 },
  { id: 4, partNo: "OIL-HYD-20L", description: "Hydraulic Oil (20L)", quantity: 3, unitCost: 4500 },
];

export const SAMPLE_LABOR: JobOrderLabor[] = [
  { id: 1, technician: "Jun Bautista", date: "2026-06-25", hours: 6, rate: 650 },
  { id: 2, technician: "Rafael Mercado", date: "2026-06-26", hours: 4, rate: 650 },
  { id: 3, technician: "Jun Bautista", date: "2026-06-27", hours: 3.5, rate: 650 },
];

export const SAMPLE_ATTACHMENTS: JobOrderAttachment[] = [
  { id: 1, name: "Inspection Report.pdf", type: "PDF", size: "1.2 MB", uploadedBy: "Jun Bautista", uploadedAt: "2026-06-25" },
  { id: 2, name: "Excavator Photo.jpg", type: "Image", size: "3.4 MB", uploadedBy: "Rafael Mercado", uploadedAt: "2026-06-25" },
  { id: 3, name: "Parts Quotation.xlsx", type: "Spreadsheet", size: "48 KB", uploadedBy: "Grace Tan", uploadedAt: "2026-06-26" },
];
