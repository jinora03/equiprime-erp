import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  Settings2,
} from "lucide-react";

import type { AppNotification } from "./types";

const NOW = new Date("2026-07-01T09:00:00Z").getTime();
const hoursAgo = (h: number) => new Date(NOW - h * 3_600_000).toISOString();

/** Dummy notification feed (UI only — no backend wiring in Phase 1). */
export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    title: "Job Order JO-2024-0105 assigned",
    description: "Engine Overhaul – Excavator assigned to Jun Bautista.",
    category: "job-order",
    icon: ClipboardList,
    createdAt: hoursAgo(1),
    read: false,
  },
  {
    id: 2,
    title: "Low stock alert",
    description: "Hydraulic Filter is down to 5 units in Main Warehouse.",
    category: "inventory",
    icon: AlertTriangle,
    createdAt: hoursAgo(3),
    read: false,
  },
  {
    id: 3,
    title: "Purchase request needs approval",
    description: "PR-2024-0312 from Purchasing is awaiting your review.",
    category: "approval",
    icon: CheckCircle2,
    createdAt: hoursAgo(6),
    read: false,
  },
  {
    id: 4,
    title: "Maria Santos mentioned you",
    description: "“@admin can you confirm the June reconciliation?”",
    category: "mention",
    icon: MessageSquare,
    createdAt: hoursAgo(22),
    read: true,
  },
  {
    id: 5,
    title: "System maintenance scheduled",
    description: "Planned downtime on Jul 6, 2026 from 10:00 PM to 11:00 PM.",
    category: "system",
    icon: Settings2,
    createdAt: hoursAgo(30),
    read: true,
  },
  {
    id: 6,
    title: "Preventive maintenance due",
    description: "Wheel Loader WL-08 is due for 250-hour service.",
    category: "job-order",
    icon: ClipboardList,
    createdAt: hoursAgo(48),
    read: true,
  },
];

export const UNREAD_COUNT = NOTIFICATIONS.filter((n) => !n.read).length;
