/** Demo data powering the dashboard. */

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
  serviceRequests: number;
  completed: number;
}

export const workOverview: WorkOverviewPoint[] = [
  { label: "May 6", jobOrders: 18, serviceRequests: 12, completed: 9 },
  { label: "May 13", jobOrders: 24, serviceRequests: 15, completed: 13 },
  { label: "May 20", jobOrders: 22, serviceRequests: 14, completed: 12 },
  { label: "May 27", jobOrders: 28, serviceRequests: 18, completed: 16 },
  { label: "Jun 3", jobOrders: 31, serviceRequests: 20, completed: 19 },
  { label: "Jun 10", jobOrders: 35, serviceRequests: 22, completed: 21 },
  { label: "Jun 17", jobOrders: 33, serviceRequests: 24, completed: 23 },
  { label: "Jun 24", jobOrders: 38, serviceRequests: 26, completed: 25 },
];

export const revenueTrend = [
  { month: "Jan", value: 1.8 },
  { month: "Feb", value: 2.1 },
  { month: "Mar", value: 1.95 },
  { month: "Apr", value: 2.35 },
  { month: "May", value: 2.2 },
  { month: "Jun", value: 2.45 },
];

export const equipmentStatus = [
  { name: "In Use", value: 45, color: CHART_COLORS.success },
  { name: "Under Service", value: 15, color: CHART_COLORS.amber },
  { name: "Idle", value: 12, color: CHART_COLORS.slate },
  { name: "Decommissioned", value: 4, color: CHART_COLORS.brand },
];

export type JobOrderStatus =
  | "Open"
  | "In Progress"
  | "Completed"
  | "On Hold";

export interface RecentJobOrder {
  id: string;
  title: string;
  customer: string;
  status: JobOrderStatus;
  date: string;
}

export const recentJobOrders: RecentJobOrder[] = [
  { id: "JO-2024-0105", title: "Engine Overhaul – Excavator", customer: "ABC Construction", status: "In Progress", date: "2026-06-28" },
  { id: "JO-2024-0104", title: "Transmission Repair", customer: "Prime Builders Corp.", status: "Open", date: "2026-06-27" },
  { id: "JO-2024-0103", title: "Hydraulic Pump Replacement", customer: "BuildWell Inc.", status: "Completed", date: "2026-06-26" },
  { id: "JO-2024-0102", title: "Undercarriage Inspection", customer: "XYZ Mining Corp.", status: "Open", date: "2026-06-25" },
  { id: "JO-2024-0101", title: "Bucket Reconditioning", customer: "Metro Aggregates", status: "Completed", date: "2026-06-24" },
];

export interface Activity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string; // ISO
}

export const activities: Activity[] = [
  { id: 1, user: "Paolo Mendoza", action: "created sales quote", target: "SQ-2024-0091", time: "2026-07-01T07:40:00Z" },
  { id: 2, user: "Jun Bautista", action: "completed work item on", target: "JO-2024-0103", time: "2026-07-01T06:15:00Z" },
  { id: 3, user: "Maria Santos", action: "approved purchase request", target: "PR-2024-0311", time: "2026-06-30T09:20:00Z" },
  { id: 4, user: "Liza Reyes", action: "onboarded new employee", target: "Patricia Ramos", time: "2026-06-30T03:05:00Z" },
  { id: 5, user: "Ramon Cruz", action: "flagged low stock for", target: "Hydraulic Filter", time: "2026-06-29T22:30:00Z" },
];

export type Priority = "High" | "Medium" | "Low";

export interface MaintenanceItem {
  id: number;
  equipment: string;
  type: string;
  due: string;
  priority: Priority;
}

export const upcomingMaintenance: MaintenanceItem[] = [
  { id: 1, equipment: "Excavator EX-12", type: "500-hour service", due: "2026-07-03", priority: "High" },
  { id: 2, equipment: "Wheel Loader WL-08", type: "250-hour service", due: "2026-07-05", priority: "Medium" },
  { id: 3, equipment: "Bulldozer BD-05", type: "Oil & filter change", due: "2026-07-08", priority: "Low" },
  { id: 4, equipment: "Crane CR-02", type: "Annual certification", due: "2026-07-10", priority: "High" },
];
