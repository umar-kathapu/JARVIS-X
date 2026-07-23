import { Tray, Menu, app, BrowserWindow } from 'electron';
import path from 'path';

export class TrayManager {
  private tray: Tray | null = null;

  initTray(mainWindow: BrowserWindow | null): void {
    if (this.tray) return;

    // Standard fallback tray icon path
    const iconPath = path.join(__dirname, '../../resources/tray-icon.png');
    this.tray = new Tray(iconPath);
    this.tray.setToolTip('JARVIS-X AI Operating System');

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open JARVIS-X',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      {
        label: 'AI Quick Prompt (Ctrl+Alt+J)',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      { type: 'separator' },
      {
        label: 'System Status: ONLINE',
        enabled: false,
      },
      { type: 'separator' },
      {
        label: 'Quit JARVIS-X',
        click: () => {
          app.quit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  destroyTray(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}

export const trayManager = new TrayManager();
