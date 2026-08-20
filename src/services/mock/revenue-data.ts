/**
 * Branch-scoped financial seed data used by the demo dashboard.
 * Kept outside the Dashboard feature so a future finance/sales service can own
 * the same records without coupling business data to presentation code.
 */
export interface RevenueEntry {
  id: number;
  companyId: string;
  branchId: string;
  period: string; // YYYY-MM
  amount: number;
}

export const revenueSeed: RevenueEntry[] = [
  { id: 1, companyId: "equiprime", branchId: "main", period: "2026-01", amount: 1_800_000 },
  { id: 2, companyId: "equiprime", branchId: "main", period: "2026-02", amount: 2_100_000 },
  { id: 3, companyId: "equiprime", branchId: "main", period: "2026-03", amount: 1_950_000 },
  { id: 4, companyId: "equiprime", branchId: "main", period: "2026-04", amount: 2_350_000 },
  { id: 5, companyId: "equiprime", branchId: "main", period: "2026-05", amount: 2_200_000 },
  { id: 6, companyId: "equiprime", branchId: "main", period: "2026-06", amount: 2_450_000 },
  { id: 7, companyId: "equiprime", branchId: "cebu", period: "2026-01", amount: 880_000 },
  { id: 8, companyId: "equiprime", branchId: "cebu", period: "2026-02", amount: 930_000 },
  { id: 9, companyId: "equiprime", branchId: "cebu", period: "2026-03", amount: 910_000 },
  { id: 10, companyId: "equiprime", branchId: "cebu", period: "2026-04", amount: 1_020_000 },
  { id: 11, companyId: "equiprime", branchId: "cebu", period: "2026-05", amount: 1_080_000 },
  { id: 12, companyId: "equiprime", branchId: "cebu", period: "2026-06", amount: 1_160_000 },
  { id: 13, companyId: "equiprime", branchId: "davao", period: "2026-01", amount: 620_000 },
  { id: 14, companyId: "equiprime", branchId: "davao", period: "2026-02", amount: 680_000 },
  { id: 15, companyId: "equiprime", branchId: "davao", period: "2026-03", amount: 710_000 },
  { id: 16, companyId: "equiprime", branchId: "davao", period: "2026-04", amount: 760_000 },
  { id: 17, companyId: "equiprime", branchId: "davao", period: "2026-05", amount: 810_000 },
  { id: 18, companyId: "equiprime", branchId: "davao", period: "2026-06", amount: 890_000 },
];
