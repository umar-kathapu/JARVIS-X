import { app, BrowserWindow } from 'electron';
import path from 'path';
import { windowManager } from './window/window.manager.js';
import { trayManager } from './tray/tray.manager.js';
import { shortcutManager } from './shortcuts/shortcut.manager.js';
import { registerIpcHandlers } from './ipc/ipc.handlers.js';

let mainWindow: BrowserWindow | null = null;

function bootstrapDesktopApp(): void {
  const preloadPath = path.join(__dirname, '../preload/index.cjs');
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  // 1. Create Main Window
  mainWindow = windowManager.createMainWindow(preloadPath, devServerUrl);

  // 2. Initialize Tray Icon & Context Menu
  trayManager.initTray(mainWindow);

  // 3. Register Global Keyboard Shortcuts (Ctrl+Alt+J)
  shortcutManager.registerGlobalShortcuts(mainWindow);

  // 4. Register IPC Handlers
  registerIpcHandlers();
}

app.whenReady().then(() => {
  bootstrapDesktopApp();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      bootstrapDesktopApp();
    }
  });
});

app.on('will-quit', () => {
  shortcutManager.unregisterAll();
  trayManager.destroyTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
