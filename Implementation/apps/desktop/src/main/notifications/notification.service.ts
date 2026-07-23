import { Notification } from 'electron';
import { NotificationPayload } from '../types/desktop.types.js';

export class DesktopNotificationService {
  private history: NotificationPayload[] = [];

  sendNotification(payload: NotificationPayload): void {
    if (Notification.isSupported()) {
      const notification = new Notification({
        title: payload.title,
        body: payload.body,
        silent: payload.silent,
      });
      notification.show();
    }
    this.history.push({ ...payload });
  }

  getHistory(): NotificationPayload[] {
    return [...this.history];
  }
}

export const desktopNotificationService = new DesktopNotificationService();
