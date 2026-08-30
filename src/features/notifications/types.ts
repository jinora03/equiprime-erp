export type NotificationCategory =
  | "job-order"
  | "inventory"
  | "approval"
  | "system"
  | "mention";

/**
 * Serializable notification shape. Keep presentation details (icons/components)
 * outside this contract so a future API can return the same payload as JSON.
 */
export interface AppNotification {
  id: number;
  title: string;
  description: string;
  category: NotificationCategory;
  createdAt: string; // ISO
  read: boolean;
}
