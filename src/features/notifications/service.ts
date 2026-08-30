import { delay } from "@/services/mock/delay";

import { notificationSeed } from "./data";
import type { AppNotification } from "./types";

const clone = (notification: AppNotification): AppNotification => ({
  ...notification,
});

const data = notificationSeed.map(clone);

export const notificationService = {
  list(): Promise<AppNotification[]> {
    return delay(data.map(clone));
  },

  async toggleRead(id: number): Promise<AppNotification> {
    const notification = data.find((item) => item.id === id);
    if (!notification) throw new Error("Notification not found.");

    notification.read = !notification.read;
    return delay(clone(notification), 150);
  },

  async markAllRead(): Promise<AppNotification[]> {
    data.forEach((notification) => {
      notification.read = true;
    });
    return delay(data.map(clone), 150);
  },
};
