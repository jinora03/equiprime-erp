/** Shared dashboard presentation types plus branch-scoped revenue seed data. */

export const CHART_COLORS = {
  primary: "#2563EB",
  brand: "#F97316",
  success: "#16A34A",
  purple: "#7C3AED",
  cyan: "#0891B2",
  slate: "#64748B",
  amber: "#D97706",
};

export interface WorkOverviewPoint {
  label: string;
  jobOrders: number;
  workItems: number;
  completed: number;
}

export interface RevenueTrendPoint {
  month: string;
  value: number;
}

export interface EquipmentStatusPoint {
  name: string;
  value: number;
  color: string;
}

export type JobOrderStatus = "Open" | "In Progress" | "Completed" | "On Hold";

export interface RecentJobOrder {
  id: number;
  code: string;
  title: string;
  customer: string;
  status: JobOrderStatus;
  date: string;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
}

export type DashboardPriority = "High" | "Medium" | "Low";

export interface MaintenanceItem {
  id: number;
  equipment: string;
  type: string;
  due: string;
  priority: DashboardPriority;
}

export interface DashboardSnapshot {
  branchName: string;
  region: string;
  currentRevenue: number;
  revenueChange: number;
  openJobOrders: number;
  equipmentUnits: number;
  employees: number;
  attendanceRate: number;
  inventoryOnHand: number;
  workOverview: WorkOverviewPoint[];
  revenueTrend: RevenueTrendPoint[];
  equipmentStatus: EquipmentStatusPoint[];
  recentJobOrders: RecentJobOrder[];
  activities: Activity[];
  upcomingMaintenance: MaintenanceItem[];
}
