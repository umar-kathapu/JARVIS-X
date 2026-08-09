import { ipcMain, BrowserWindow } from 'electron';
import { z } from 'zod';
import { windowManager } from '../window/window.manager.js';
import { systemInfoService } from '../system/system-info.service.js';
import { desktopNotificationService } from '../notifications/notification.service.js';
import { clipboardService } from '../clipboard/clipboard.service.js';
import { filesystemService } from '../filesystem/filesystem.service.js';
import { terminalService } from '../terminal/terminal.service.js';
import { screenService } from '../screen/screen.service.js';

// Strict Zod Validation Schemas for IPC Channels
const SetAlwaysOnTopSchema = z.boolean();
const SendNotificationSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
});
const WriteClipboardSchema = z.string().max(10000);
const ExecuteTerminalSchema = z.object({
  command: z.string().min(1).max(100),
  args: z.array(z.string()).optional(),
});

export function registerIpcHandlers(): void {
  // 1. System Metrics & Status
  ipcMain.handle('GET_SYSTEM_METRICS', async (event) => {
    if (!event.senderFrame) return null;
    return systemInfoService.getMetrics();
  });

  // 2. Window Controls
  ipcMain.handle('SET_ALWAYS_ON_TOP', async (event, flag: unknown) => {
    if (!event.senderFrame) return false;
    const validatedFlag = SetAlwaysOnTopSchema.parse(flag);
    windowManager.setAlwaysOnTop(validatedFlag);
    return true;
  });

  ipcMain.handle('GET_WINDOW_STATE', async (event) => {
    if (!event.senderFrame) return null;
    return windowManager.getWindowState();
  });

  // 3. Notifications
  ipcMain.handle('SEND_NOTIFICATION', async (event, payload: unknown) => {
    if (!event.senderFrame) return false;
    const validatedPayload = SendNotificationSchema.parse(payload);
    desktopNotificationService.sendNotification(validatedPayload);
    return true;
  });

  // 4. Clipboard
  ipcMain.handle('READ_CLIPBOARD', async (event) => {
    if (!event.senderFrame) return '';
    return clipboardService.readText();
  });

  ipcMain.handle('WRITE_CLIPBOARD', async (event, text: unknown) => {
    if (!event.senderFrame) return false;
    const validatedText = WriteClipboardSchema.parse(text);
    clipboardService.writeText(validatedText);
    return true;
  });

  // 5. Filesystem
  ipcMain.handle('SELECT_FILE', async (event) => {
    if (!event.senderFrame) return null;
    const win = BrowserWindow.fromWebContents(event.sender);
    return filesystemService.selectFile(win || undefined);
  });

  // 6. Terminal Execution (Sanitized & Allowlisted)
  ipcMain.handle('EXECUTE_TERMINAL', async (event, payload: unknown) => {
    if (!event.senderFrame) {
      return {
        id: `term_error_${Date.now()}`,
        command: '',
        output: 'Security Alert: Invalid IPC Sender Frame',
        exitCode: 1,
      };
    }
    const rawPayload = typeof payload === 'string' ? { command: payload } : payload;
    const validated = ExecuteTerminalSchema.parse(rawPayload);
    return terminalService.executeCommand(validated);
  });

  // 7. Screen Capture
  ipcMain.handle('CAPTURE_SCREEN', async (event) => {
    if (!event.senderFrame) return null;
    return screenService.capturePrimaryScreen();
  });
}
