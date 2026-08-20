import {
  BadgeDollarSign,
  BarChart3,
  Banknote,
  Bell,
  Boxes,
  Building2,
  Calculator,
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  Contact,
  FolderKanban,
  Forklift,
  Handshake,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  ShoppingCart,
  UserCog,
  Users,
  Warehouse,
  Workflow,
  Wrench,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { viewKey } from "@/constants/modules";
import type { NavSection } from "@/types";

/**
 * Sidebar navigation. Items are permission-aware; deferred modules are flagged
 * `comingSoon` and route to the shared placeholder. Connected Customers and
 * Equipment views support the service demo alongside the workflow modules.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        path: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
        permission: viewKey("dashboard"),
      },
      {
        id: "approvals",
        label: "My Approvals",
        path: ROUTES.APPROVALS,
        icon: ClipboardCheck,
        permission: viewKey("approvals"),
      },
    ],
  },
  {
    id: "business",
    label: "Business",
    items: [
      { id: "crm", label: "CRM", path: ROUTES.CRM, icon: Handshake, permission: viewKey("crm"), comingSoon: true },
      { id: "customers", label: "Customers", path: ROUTES.CUSTOMERS, icon: Contact, permission: viewKey("customers") },
      { id: "sales", label: "Sales", path: ROUTES.SALES, icon: BadgeDollarSign, permission: viewKey("sales"), comingSoon: true },
      { id: "purchasing", label: "Purchasing", path: ROUTES.PURCHASING, icon: ShoppingCart, permission: viewKey("purchasing"), comingSoon: true },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { id: "equipment", label: "Equipment", path: ROUTES.EQUIPMENT, icon: Forklift, permission: viewKey("equipment") },
      { id: "inventory", label: "Inventory", path: ROUTES.INVENTORY, icon: Boxes, permission: viewKey("inventory") },
      { id: "warehouse", label: "Warehouse", path: ROUTES.WAREHOUSE, icon: Warehouse, permission: viewKey("warehouse"), comingSoon: true },
    ],
  },
  {
    id: "service",
    label: "Service",
    items: [
      { id: "job-orders", label: "Job Orders", path: ROUTES.JOB_ORDERS, icon: ClipboardList, permission: viewKey("job-orders") },
      { id: "projects", label: "Projects", path: ROUTES.PROJECTS, icon: FolderKanban, permission: viewKey("projects") },
      { id: "maintenance", label: "Maintenance", path: ROUTES.MAINTENANCE, icon: Wrench, permission: viewKey("maintenance") },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { id: "hr", label: "HR", path: ROUTES.HR, icon: Users, permission: viewKey("hr"), comingSoon: true },
      { id: "attendance", label: "Attendance", path: ROUTES.ATTENDANCE, icon: CalendarCheck, permission: viewKey("attendance"), comingSoon: true },
      { id: "payroll", label: "Payroll", path: ROUTES.PAYROLL, icon: Banknote, permission: viewKey("payroll"), comingSoon: true },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      { id: "accounting", label: "Accounting", path: ROUTES.ACCOUNTING, icon: Calculator, permission: viewKey("accounting"), comingSoon: true },
      { id: "reports", label: "Reports", path: ROUTES.REPORTS, icon: BarChart3, permission: viewKey("reports"), comingSoon: true },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      { id: "users", label: "Users", path: ROUTES.USERS, icon: UserCog, permission: viewKey("users") },
      { id: "roles", label: "Roles", path: ROUTES.ROLES, icon: ShieldCheck, permission: viewKey("roles") },
      { id: "departments", label: "Departments", path: ROUTES.DEPARTMENTS, icon: Building2, permission: viewKey("departments") },
      { id: "workflows", label: "Workflows", path: ROUTES.WORKFLOWS, icon: Workflow, permission: viewKey("workflows") },
      { id: "notifications", label: "Notifications", path: ROUTES.NOTIFICATIONS, icon: Bell, permission: viewKey("notifications") },
      { id: "settings", label: "Settings", path: ROUTES.SETTINGS, icon: Settings, permission: viewKey("settings") },
    ],
  },
];
