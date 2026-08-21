/** Shared dashboard presentation types for organization-scoped operational data. */

export const CHART_COLORS = {
  primary: "hsl(var(--chart-primary))",
  brand: "hsl(var(--chart-brand))",
  success: "hsl(var(--chart-success))",
  warning: "hsl(var(--chart-warning))",
  neutral: "hsl(var(--chart-neutral))",
  danger: "hsl(var(--chart-danger))",
};

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
export type DashboardPriority = "High" | "Medium" | "Low";

export interface RecentJobOrder {
  id: number;
  code: string;
  title: string;
  customer: string;
  equipment: string;
  technician: string;
  priority: DashboardPriority;
  status: JobOrderStatus;
  dueDate: string;
  date: string;
  overdue: boolean;
}

export type DashboardActivityTargetKind =
  | "job_order"
  | "job_order_parts"
  | "maintenance";

export interface Activity {
  id: string;
  user: string;
  verb: string;
  target: string;
  suffix?: string;
  detail?: string;
  time: string;
  targetKind?: DashboardActivityTargetKind;
  targetId?: number;
}

export interface MaintenanceItem {
  id: number;
  equipment: string;
  type: string;
  due: string;
  priority: DashboardPriority;
  overdue: boolean;
}

export type DashboardAttentionKey =
  | "overdue_job_orders"
  | "overdue_maintenance"
  | "waiting_for_parts"
  | "low_stock_inventory";

export interface DashboardAttentionItem {
  key: DashboardAttentionKey;
  count: number;
  label: string;
  detail: string;
}

export interface DashboardSnapshot {
  branchName: string;
  region: string;
  currentRevenue: number;
  revenueChange: number;
  openJobOrders: number;
  overdueJobOrders: number;
  equipmentUnits: number;
  equipmentUtilization: number;
  inventoryOnHand: number;
  lowStockItems: number;
  attention: DashboardAttentionItem[];
  revenueTrend: RevenueTrendPoint[];
  equipmentStatus: EquipmentStatusPoint[];
  recentJobOrders: RecentJobOrder[];
  activities: Activity[];
  upcomingMaintenance: MaintenanceItem[];
}
