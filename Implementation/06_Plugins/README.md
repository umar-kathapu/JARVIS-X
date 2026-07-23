# 06_Plugins

## Purpose
The `06_Plugins` folder contains the sandboxed plugin framework, SDK, runtime manager, and installed skill extensions for JARVIS-X. It allows third-party developers and contributors to extend system capabilities safely without modifying core source repositories.

---

## Responsibilities
- **Plugin Sandbox Isolation**: Executing third-party plugin skills inside isolated Node.js `worker_threads` with strict V8 memory bounds (128 MB max).
- **Permission Scope Validation**: Enforcing strict capability permissions (`net:http`, `fs:read`, `hardware:mic`, `ai:inference`) via user consent gates.
- **Dynamic Skill Registration**: Registering plugin tools with the AI Brain tool caller at runtime.
- **Hot Reloading**: Supporting dynamic plugin installation, activation, suspension, and removal without application restart.
- **Plugin SDK**: Providing the `@jarvis-x/plugin-sdk` base class and `PluginContext` API.

---

## Files Created in this Folder
- `sdk/`: The core `@jarvis-x/plugin-sdk` package (`BasePlugin`, `PluginContext`, `SkillResult`).
- `runtime/`: Sandboxed `WorkerThread` execution manager and permission validator.
- `registry/`: Installed plugins catalog index and manifest validator.
- `cli/`: `jvx-cli` developer tool for packaging `.jvx` plugin bundles.
- `installed/`: Directory storing active installed plugin packages (`com.jarvis.plugin.smart-home`).

---

## Development Workflow
1. Navigate to `Implementation/06_Plugins/`.
2. Create a new plugin directory or use `jvx-cli create my-plugin`.
3. Define permissions and metadata in `manifest.json`.
4. Implement skill logic in `src/index.ts` extending `BasePlugin`.
5. Run `pnpm run test:plugin` to execute unit tests using the mock context harness.

---

## System Integration
Plugins interact with `02_Backend` via permission-gated IPC bridges, register executable tools with `04_AI`, render visual widgets inside `01_Frontend` dashboards, receive system events from `07_Automation`, and execute natively within `08_Desktop` overlay shells.
