import { globalShortcut, BrowserWindow } from 'electron';

export class ShortcutManager {
  registerGlobalShortcuts(mainWindow: BrowserWindow | null): void {
    globalShortcut.unregisterAll();

    // Ctrl+Alt+J Quick AI Chat hotkey
    globalShortcut.register('CommandOrControl+Alt+J', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
  }

  unregisterAll(): void {
    globalShortcut.unregisterAll();
  }
}

export const shortcutManager = new ShortcutManager();
