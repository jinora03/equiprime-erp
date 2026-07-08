import type { LucideIcon } from "lucide-react";

export type NotificationCategory =
  | "job-order"
  | "inventory"
  | "approval"
  | "system"
  | "mention";

export interface AppNotification {
  id: number;
  title: string;
  description: string;
  category: NotificationCategory;
  icon: LucideIcon;
  createdAt: string; // ISO
  read: boolean;
}
