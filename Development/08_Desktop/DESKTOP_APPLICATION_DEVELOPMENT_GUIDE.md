# Desktop Application Development Guide

Welcome to the **JARVIS-X** Desktop Application Development Guide. JARVIS-X is an enterprise-grade, Iron Man-inspired AI Operating System designed to deliver real-time multi-modal intelligence, voice interface control, computer vision perception, autonomous task execution, and desktop integration.

This document serves as the official, implementation-ready architectural manual for designing, developing, securing, packaging, and maintaining the Electron-based native desktop application of JARVIS-X.

---

## 1. Purpose

The desktop application layer acts as the primary native shell for JARVIS-X. While the web interface handles browser-based interaction, the desktop application provides native operating system integration including:

- **Ambient Desktop Overlay**: A translucent, frameless heads-up display (HUD) that floats seamlessly over all host windows.
- **Global Keybinding Listeners**: System-wide hotkeys (e.g., `Option+Space` / `Alt+Space`) to activate voice input or quick AI command input instantly.
- **Native Hardware Access**: Direct access to local webcams, microphones, system audio buffers, and hardware telemetry sensors.
- **OS Control & Tray Integration**: Native system tray controls, desktop toast notifications, and login auto-launch capabilities.

---

## 2. Desktop Vision

The vision for the JARVIS-X desktop application is to deliver a sleek, responsive, translucent AI Operating System overlay that feels natively integrated into Windows, macOS, and Linux workstations.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      JARVIS-X DESKTOP NATIVE SHELL                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌───────────────────┐    ┌───────────────────┐    ┌────────────────┐  │
│   │ FRAMELESS HUD     │    │ SECURE IPC BRIDGE │    │ NATIVE HARDWARE│  │
│   │ Translucent Glass │    │ ContextIsolation  │    │ Global Hotkeys │  │
│   │ Floating Overlay  │    │ Typed Channels    │    │ Cam / Mic / OS │  │
│   └─────────┬─────────┘    └─────────┬─────────┘    └───────┬────────┘  │
│             │                        │                      │           │
│             └────────────────────────┼──────────────────────┘           │
│                                      │                                  │
│                   ┌──────────────────▼──────────────────┐               │
│                   │      CROSS-PLATFORM DISTRIBUTION    │               │
│                   │ macOS DMG | Windows NSIS | Linux App│               │
│                   └─────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DESKTOP TECH STACK                            │
├───────────────┬──────────────────────────┬──────────────────────────────┤
│ Layer         │ Technology               │ Purpose & Role               │
├───────────────┼──────────────────────────┼──────────────────────────────┤
│ Native Shell  │ Electron (v30.x+)        │ Cross-platform desktop runtime│
│ Main Process  │ Node.js 22 LTS           │ OS integration & process control│
│ UI Framework  │ React 18/19 & Next.js    │ Declarative HUD interface    │
│ Language      │ TypeScript (v5.x)        │ Strict type safety across IPC│
│ Packaging     │ Electron Builder         │ Installer & binary generation│
│ Styling       │ Tailwind CSS             │ Glassmorphic utility design  │
│ Motion        │ Framer Motion            │ Physics-based HUD animations │
└───────────────┴──────────────────────────┴──────────────────────────────┘
```

---

## 4. Desktop Architecture

Electron separates execution into two primary process types connected via a secure IPC preload bridge:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     ELECTRON PROCESS ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │ MAIN PROCESS (Node.js Environment)                              │   │
│   │  ├── Window Manager (BrowserWindow instances)                   │   │
│   │  ├── Global Hotkey Listener (`Option+Space`)                    │   │
│   │  ├── System Tray & Auto-Launcher                                │   │
│   │  └── Native Hardware APIs                                       │   │
│   └────────────────────────────────┬────────────────────────────────┘   │
│                                    │                                    │
│                        SECURE PRELOAD IPC BRIDGE                        │
│                 (`contextBridge.exposeInMainWorld`)                     │
│                                    │                                    │
│   ┌────────────────────────────────▼────────────────────────────────┐   │
│   │ RENDERER PROCESS (Chromium Environment)                         │   │
│   │  ├── Next.js / React UI Component Tree                          │   │
│   │  ├── 60 FPS Audio Visualizer Canvas                             │   │
│   │  └── Camera Vision Overlay Canvas                               │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Project Structure

The desktop application source code in `Development/08_Desktop/` is structured as follows:

```
Development/08_Desktop/
├── main/                       # Electron Main Process source code
│   ├── index.ts                # Main process entry point (app ready handler)
│   ├── window-manager.ts       # BrowserWindow creation & lifecycle manager
│   ├── tray.ts                 # System tray icon & context menu manager
│   └── hotkeys.ts              # Global keyboard shortcut listener
├── preload/                    # Preload scripts (Bridge layer)
│   └── index.ts                # Exposes type-safe `window.electronAPI` methods
├── renderer/                   # Next.js React UI Renderer application
│   ├── components/             # Desktop-specific UI widgets & HUD overlays
│   └── hooks/                  # `useElectronIPC` hooks
├── ipc/                        # IPC Channel Protocol Definitions
│   ├── system.ipc.ts           # System status & hardware IPC handlers
│   └── window.ipc.ts           # Window minimize, maximize, close handlers
├── native/                     # Native C++ bindings & OS integrations
│   └── audio-hook.cc           # Low-level system audio capture binding
├── assets/                     # App icons, tray graphics, and splash images
│   ├── icon.ico                # Windows executable icon
│   ├── icon.icns               # macOS bundle icon
│   └── tray-icon.png           # System tray icon (16x16 / 32x32 template)
├── config/                     # Electron build & window position configs
├── services/                   # Background node services running in main
├── utils/                      # Helper utilities
├── electron-builder.json       # Electron packaging configuration
└── tsconfig.json               # TypeScript configuration
```

---

## 6. Window Management

The application manages multiple specialized window instances:

1. **Main HUD Overlay Window**: Frameless, translucent (`transparent: true`), always-on-top overlay window that hosts the primary JARVIS-X UI.
2. **Splash Screen**: Lightweight startup window (`width: 400`, `height: 300`) displayed immediately while the main renderer loads.
3. **Settings Window**: Dedicated modal window for configuring API keys and hardware preferences.
4. **Window State Persistence**: Uses `electron-store` to save and restore window positions, sizes, and display arrangements across restarts.

---

## 7. IPC Communication Protocol

All IPC communication between Renderer and Main processes strictly uses `contextBridge`:

### 7.1 Preload Script Definition (`preload/index.ts`)

```typescript
import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  getSystemMetrics: () => ipcRenderer.invoke('system:get-metrics'),
  toggleHUD: () => ipcRenderer.send('window:toggle-hud'),
  onVoiceTrigger: (callback: (transcript: string) => void) => {
    ipcRenderer.on('voice:transcript', (_event, value) => callback(value));
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
```

---

### 7.2 Main Process IPC Handler (`ipc/system.ipc.ts`)

```typescript
import { ipcMain } from 'electron';

ipcMain.handle('system:get-metrics', async () => {
  return {
    cpuUsage: 12.4,
    ramUsedGB: 6.8,
    uptimeSeconds: process.uptime(),
  };
});
```

---

## 8. Native OS Integrations

- **System Tray**: Displays a minimal monochrome JARVIS icon in the macOS menu bar or Windows system tray with quick actions ("Show HUD", "Toggle Mic", "Exit").
- **Global Shortcuts**: Registers global keybindings using Electron's `globalShortcut` module:
  ```typescript
  globalShortcut.register('Option+Space', () => {
    WindowManager.toggleMainHUDWindow();
  });
  ```
- **Auto Launch**: Configured using `app.setLoginItemSettings({ openAtLogin: true })`.

---

## 9. Performance & Security Optimization

1. **Strict Security Flags**:
   - `"contextIsolation": true` (Mandatory).
   - `"nodeIntegration": false` (Mandatory).
   - `"sandbox": true` (Mandatory for all renderer windows).
2. **Content Security Policy (CSP)**:
   ```html
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" />
   ```
3. **Single Instance Lock**: Ensures only one instance of JARVIS-X executes simultaneously using `app.requestSingleInstanceLock()`.

---

## 10. Auto Updates

Uses `electron-updater` connected to GitHub Releases or a self-hosted update server:

```typescript
import { autoUpdater } from 'electron-updater';

autoUpdater.on('update-available', () => {
  WindowManager.notifyRenderer('update:available');
});

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall();
});
```

---

## 11. Packaging & Distribution

Build settings are configured in `electron-builder.json`:

```json
{
  "appId": "com.jarvis.desktop",
  "productName": "JARVIS-X",
  "directories": {
    "output": "dist/installers"
  },
  "mac": {
    "category": "public.app-category.productivity",
    "target": ["dmg", "zip"],
    "hardenedRuntime": true,
    "gatekeeperAssess": false
  },
  "win": {
    "target": ["nsis", "portable"]
  },
  "linux": {
    "target": ["AppImage", "deb"]
  }
}
```

```bash
# Package application for host platform
pnpm run build:desktop
```

---

## 12. Desktop Testing

```bash
# Execute Playwright Electron End-to-End tests
pnpm run test:e2e:desktop
```

---

## 13. Best Practices

1. **Destroy Window References on Close**: Nullify window instances in `closed` event handlers to prevent memory leaks.
2. **Handle Power Monitor Suspend/Resume**: Pause background WebSocket telemetry connections when the OS enters sleep mode.
3. **Never Block the Main Process Thread**: Keep heavy computations inside worker threads or offloaded to the backend FastAPI server.

---

## 14. Acceptance Criteria

The desktop application is production-ready when:

- [ ] **Security Settings Verified**: `contextIsolation: true` and `nodeIntegration: false` verified across all windows.
- [ ] **Startup Time**: Application displays splash screen in **<800ms** and main HUD in **<1.5s**.
- [ ] **Cross-Platform Bundles**: Packages build cleanly for macOS (`.dmg`), Windows (`.exe`), and Linux (`.AppImage`).
- [ ] **Global Shortcuts**: `Option+Space` / `Alt+Space` hotkeys trigger HUD window toggle reliably.

---

## 15. Conclusion

Following this Desktop Application Development Guide ensures that the JARVIS-X desktop app remains fast, secure, beautiful, and deeply integrated into host operating systems. By standardizing Electron IPC protocols, window lifecycle management, and packaging workflows, developers can build a world-class desktop experience.
