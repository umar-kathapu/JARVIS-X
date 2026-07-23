import { ipcMain, BrowserWindow } from 'electron';
import { windowManager } from '../window/window.manager.js';
import { systemInfoService } from '../system/system-info.service.js';
import { desktopNotificationService } from '../notifications/notification.service.js';
import { clipboardService } from '../clipboard/clipboard.service.js';
import { filesystemService } from '../filesystem/filesystem.service.js';
import { terminalService } from '../terminal/terminal.service.js';
import { screenService } from '../screen/screen.service.js';

export function registerIpcHandlers(): void {
  // System Metrics & Status
  ipcMain.handle('GET_SYSTEM_METRICS', async () => {
    return systemInfoService.getMetrics();
  });

  // Window Controls
  ipcMain.handle('SET_ALWAYS_ON_TOP', async (_event, flag: boolean) => {
    windowManager.setAlwaysOnTop(flag);
    return true;
  });

  ipcMain.handle('GET_WINDOW_STATE', async () => {
    return windowManager.getWindowState();
  });

  // Notifications
  ipcMain.handle('SEND_NOTIFICATION', async (_event, payload) => {
    desktopNotificationService.sendNotification(payload);
    return true;
  });

  // Clipboard
  ipcMain.handle('READ_CLIPBOARD', async () => {
    return clipboardService.readText();
  });

  ipcMain.handle('WRITE_CLIPBOARD', async (_event, text: string) => {
    clipboardService.writeText(text);
    return true;
  });

  // Filesystem
  ipcMain.handle('SELECT_FILE', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return filesystemService.selectFile(win || undefined);
  });

  // Terminal
  ipcMain.handle('EXECUTE_TERMINAL', async (_event, command: string) => {
    return terminalService.executeCommand(command);
  });

  // Screen Capture
  ipcMain.handle('CAPTURE_SCREEN', async () => {
    return screenService.capturePrimaryScreen();
  });
}
