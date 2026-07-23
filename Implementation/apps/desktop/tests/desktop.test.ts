import { describe, it, expect } from 'vitest';
import { systemInfoService } from '../src/main/system/system-info.service.js';
import { desktopNotificationService } from '../src/main/notifications/notification.service.js';
import { clipboardService } from '../src/main/clipboard/clipboard.service.js';

describe('Native Desktop Integration Unit Tests', () => {
  it('systemInfoService should return non-null system metrics', () => {
    const metrics = systemInfoService.getMetrics();
    expect(metrics.totalMemoryMb).toBeGreaterThan(0);
    expect(metrics.freeMemoryMb).toBeGreaterThan(0);
    expect(metrics.platform).toBeTruthy();
  });

  it('desktopNotificationService should track notification history', () => {
    desktopNotificationService.sendNotification({
      title: 'Test Title',
      body: 'Test Notification Body',
    });

    const history = desktopNotificationService.getHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[history.length - 1]?.title).toBe('Test Title');
  });

  it('clipboardService should store history entries', () => {
    clipboardService.writeText('JARVIS-X Clipboard Content');
    const history = clipboardService.getHistory();
    expect(history.length).toBeGreaterThan(0);
    expect(history[0]?.text).toBe('JARVIS-X Clipboard Content');
  });
});
