# 08_Desktop

## Purpose
The `08_Desktop` folder contains the native desktop application wrapper for JARVIS-X. Built with Electron v30.x+, Node.js 22 LTS, and TypeScript, it packages the Next.js frontend into a native, cross-platform desktop application for macOS, Windows, and Linux.

---

## Responsibilities
- **Frameless Translucent HUD Window**: Managing an always-on-top, translucent (`transparent: true`), frameless desktop overlay.
- **Global Keybinding Interception**: Listening for system-wide hotkeys (e.g., `Option+Space` / `Alt+Space`) to toggle voice or HUD overlay windows instantly.
- **System Tray Controls**: Providing a native menu bar / system tray icon with quick controls ("Toggle HUD", "Mute Mic", "Quit").
- **Secure Preload IPC Bridge**: Exposing type-safe native APIs (`window.electronAPI`) using `contextBridge` with `contextIsolation: true` and `nodeIntegration: false`.
- **Cross-Platform Packaging**: Compiling installer packages (`.dmg`, `.exe`, `.AppImage`) via Electron Builder.

---

## Files Created in this Folder
- `main/index.ts`: Electron Main Process entry point and application ready handler.
- `main/window-manager.ts`: BrowserWindow creation, positioning, and transparency manager.
- `main/hotkeys.ts`: Global keyboard shortcut listener registration module.
- `main/tray.ts`: System tray icon and context menu manager.
- `preload/index.ts`: Context isolation IPC preload script exposing `window.electronAPI`.
- `ipc/`: Main process IPC event handlers (`system.ipc.ts`, `window.ipc.ts`).
- `electron-builder.json`: Multi-platform packaging and code signing configuration.

---

## Development Workflow
1. Navigate to `Implementation/08_Desktop/`.
2. Run `pnpm dev` to launch the Electron main process connected to the Next.js renderer dev server.
3. Run `pnpm run build:desktop` to compile TypeScript and generate native installers.
4. Execute `pnpm run test:e2e:desktop` to run Playwright Electron end-to-end window tests.

---

## System Integration
The desktop native shell hosts `01_Frontend` inside Chromium `BrowserWindow` instances, communicates with `02_Backend` via REST/WebSockets, provides native audio/vision stream inputs to `04_AI`, and executes OS file and window actions requested by `07_Automation`.
