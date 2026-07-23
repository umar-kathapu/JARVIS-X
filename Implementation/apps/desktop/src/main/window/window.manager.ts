import { BrowserWindow } from 'electron';
import path from 'path';
import { WindowState } from '../types/desktop.types.js';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private chatPanelWindow: BrowserWindow | null = null;

  createMainWindow(preloadPath: string, devServerUrl?: string): BrowserWindow {
    this.mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 900,
      minHeight: 600,
      title: 'JARVIS-X Desktop AI Operating System',
      titleBarStyle: 'hiddenInset',
      backgroundColor: '#090d16',
      webPreferences: {
        preload: preloadPath,
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
      },
    });

    if (devServerUrl) {
      this.mainWindow.loadURL(devServerUrl);
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));
    }

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    return this.mainWindow;
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  setAlwaysOnTop(flag: boolean): void {
    if (this.mainWindow) {
      this.mainWindow.setAlwaysOnTop(flag);
    }
  }

  getWindowState(): WindowState {
    if (!this.mainWindow) {
      return { width: 1280, height: 800, isMaximized: false, isAlwaysOnTop: false };
    }
    const bounds = this.mainWindow.getBounds();
    return {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
      isMaximized: this.mainWindow.isMaximized(),
      isAlwaysOnTop: this.mainWindow.isAlwaysOnTop(),
    };
  }
}

export const windowManager = new WindowManager();
