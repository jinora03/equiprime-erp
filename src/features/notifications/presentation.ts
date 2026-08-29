import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  Settings2,
  type LucideIcon,
} from "lucide-react";

import type { NotificationCategory } from "./types";

const ICONS: Record<NotificationCategory, LucideIcon> = {
  "job-order": ClipboardList,
  inventory: AlertTriangle,
  approval: CheckCircle2,
  mention: MessageSquare,
  system: Settings2,
};

export const getNotificationIcon = (category: NotificationCategory) =>
  ICONS[category];
