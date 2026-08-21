import {
  Building2,
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  PanelLeft,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";
import type { OnboardingStep } from "./types";

/**
 * Product-tour content only. Business components expose stable data attributes;
 * this feature owns all tour copy, routing, permissions, and presentation.
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "organization",
    title: "Switch company or branch",
    description:
      "Each branch has its own connected demo data. Switching here updates the Dashboard and supported modules together.",
    icon: Building2,
    target: '[data-onboarding="company-switcher"]',
    route: ROUTES.DASHBOARD,
    permission: "dashboard:view",
    desktopOnly: true,
  },
  {
    id: "dashboard",
    title: "Start with the Dashboard",
    description:
      "These KPIs and activity cards are derived from the same Job Orders, people, equipment, inventory, and branch data used elsewhere in Equiprime.",
    icon: LayoutDashboard,
    target: '[data-onboarding="dashboard"]',
    route: ROUTES.DASHBOARD,
    permission: "dashboard:view",
  },
  {
    id: "navigation",
    title: "Your modules follow your access",
    description:
      "The navigation only exposes modules allowed by your current permissions. On mobile, open the menu from this control.",
    icon: PanelLeft,
    target: '[data-onboarding="sidebar-navigation"]',
    mobileTarget: '[data-onboarding="mobile-menu"]',
    highlightMaxHeight: 360,
  },
  {
    id: "job-orders",
    title: "Follow service work end to end",
    description:
      "Job Orders connect customers, equipment, technicians, Work Items, parts, and configured workflow stages in one service record.",
    icon: ClipboardList,
    target: '[data-onboarding="job-orders"]',
    route: ROUTES.JOB_ORDERS,
    permission: "job-orders:view",
  },
  {
    id: "approvals",
    title: "Review only the approvals assigned to you",
    description:
      "My Approvals is role-aware. Authorized approvers can review workflow and operational requests without needing broad access to the source module.",
    icon: ClipboardCheck,
    target: '[data-onboarding="approvals"]',
    route: ROUTES.APPROVALS,
    permission: "approvals:view",
  },
  {
    id: "replay",
    title: "Replay the guide anytime",
    description:
      "Open your account menu whenever you want to run this quick product tour again.",
    icon: CircleHelp,
    target: '[data-onboarding="user-menu"]',
  },
];
