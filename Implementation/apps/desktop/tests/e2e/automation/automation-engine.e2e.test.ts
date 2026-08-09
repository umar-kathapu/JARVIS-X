import { describe, it, expect } from 'vitest';
import { desktopNotificationService } from '../../../src/main/notifications/notification.service.js';

describe('E2E Desktop Automation & System Notifications', () => {
  it('1. Should trigger desktop notification for automated workflow events', () => {
    desktopNotificationService.sendNotification({
      title: 'Automated Backup Completed',
      body: 'System state successfully archived to lifelong memory store.',
    });

    const history = desktopNotificationService.getHistory();
    expect(history.length).toBeGreaterThan(0);
    const lastNotif = history[history.length - 1];
    expect(lastNotif?.title).toBe('Automated Backup Completed');
    expect(lastNotif?.body).toContain('lifelong memory store');
  });
});
