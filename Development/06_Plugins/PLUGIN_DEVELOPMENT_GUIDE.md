# Plugin Development Guide

Welcome to the **JARVIS-X** Plugin Development Guide. JARVIS-X is an enterprise-grade, Iron Man-inspired AI Operating System designed to deliver real-time multi-modal intelligence, voice interface control, computer vision perception, autonomous task execution, and desktop integration.

This document serves as the official, implementation-ready architectural manual for designing, developing, sandboxing, testing, distributing, and maintaining plugins and skills within the JARVIS-X ecosystem.

---

## 1. Purpose

The JARVIS-X Plugin System provides an extensible, modular architecture that allows developers to add new capabilities, third-party service integrations, smart home controls, and custom tools to the AI Operating System without modifying core codebase repositories. Key objectives include:

- **Modular System Extension**: Enabling third-party skills (e.g., Spotify playback, Smart Home IoT control, GitHub automation, custom web search).
- **Sandboxed Safety**: Isolating third-party code in sandboxed execution contexts to protect system security and host OS integrity.
- **Dynamic Capability Discovery**: Allowing the AI Brain to dynamically discover, inspect, and invoke plugin skills via structured tool calling schemas.
- **Hot Reloading**: Supporting dynamic plugin installation, activation, suspension, and uninstallation without restarting the core application.

---

## 2. Plugin Vision

The vision for the JARVIS-X plugin ecosystem is to create a secure, community-driven marketplace and developer toolkit enabling thousands of custom skills while enforcing a strict zero-trust permission security model.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       JARVIS-X PLUGIN ECOSYSTEM                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌───────────────────┐    ┌───────────────────┐    ┌────────────────┐  │
│   │ SANDBOX RUNTIME   │    │ PERMISSION MODEL  │    │ AI TOOL BIND   │  │
│   │ Worker Threads    │    │ Explicit Scopes   │    │ Dynamic Schema │  │
│   │ Isolated Memory   │    │ User Consent Gate │    │ Auto Discovery │  │
│   └─────────┬─────────┘    └─────────┬─────────┘    └───────┬────────┘  │
│             │                        │                      │           │
│             └────────────────────────┼──────────────────────┘           │
│                                      │                                  │
│                   ┌──────────────────▼──────────────────┐               │
│                   │      COMMUNITY MARKETPLACE & SDK    │               │
│                   │ SemVer Packaging | Signed Bundles   │               │
│                   └─────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Plugin Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      PLUGIN SYSTEM ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   AI BRAIN / BACKEND GATEWAY                                            │
│         │                                                               │
│         ▼                                                               │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ 1. PLUGIN MANAGER & CATALOG REGISTRY                              │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                    │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │ 2. PERMISSION VALIDATOR & CONSENT GATE                            │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                    │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │ 3. SANDBOXED RUNTIME (Worker Threads / Subprocesses)              │  │
│  │    ┌───────────────────────────────────────────────────────────┐  │  │
│  │    │ PLUGIN INSTANCE (Extends BasePlugin SDK)                  │  │  │
│  │    │  ├── Plugin Context API (AI, Memory, Storage, Voice)      │  │  │
│  │    │  └── Skill Function Handlers                              │  │  │
│  │    └───────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                    │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │ 4. EVENT BUS & SYSTEM IPC (Redis Pub/Sub & Electron Bridge)      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PLUGIN TECH STACK                             │
├───────────────┬──────────────────────────┬──────────────────────────────┤
│ Component     │ Technology               │ Purpose & Role               │
├───────────────┼──────────────────────────┼──────────────────────────────┤
│ Language      │ TypeScript (v5.x)        │ Type-safe plugin development │
│ Execution     │ Node.js `worker_threads` │ Isolated memory sandboxing   │
│ Metadata      │ JSON Manifest            │ Plugin declaration & scopes  │
│ Communication │ Event Emitter / PubSub   │ Asynchronous event bus       │
│ UI Rendering  │ Electron IPC / React HUD │ Custom HUD widget rendering  │
│ Packaging     │ Zip (`.jvx` package)     │ Versioned plugin archives    │
└───────────────┴──────────────────────────┴──────────────────────────────┘
```

---

## 5. Plugin Structure

A standard JARVIS-X plugin project layout follows this structure:

```
my-jarvis-plugin/
├── manifest.json               # Required plugin manifest specification
├── src/                        # Plugin TypeScript source code
│   ├── index.ts                # Main plugin entry point (exports default class)
│   ├── skills/                 # Individual skill function implementations
│   │   ├── spotify.skill.ts
│   │   └── smart-home.skill.ts
│   └── utils/                  # Helper utilities
├── assets/                     # Graphic icons and HUD visual components
│   └── icon.svg                # 64x64 SVG logo mark
├── config/                     # Configuration files & default settings
│   └── settings.schema.json    # JSON Schema for user configurable settings
├── docs/                       # Developer documentation & guide
├── tests/                      # Unit test suite for plugin skills
│   └── plugin.test.ts
├── package.json                # Node package dependencies
└── README.md                   # Plugin summary & usage instructions
```

---

## 6. Plugin Manifest Specification

Every plugin must include a valid `manifest.json` file in its root directory:

```json
{
  "id": "com.jarvis.plugin.smart-home",
  "name": "Smart Home Controller",
  "version": "1.0.0",
  "author": "JARVIS-X Engineering",
  "description": "Control local Home Assistant lights, thermostats, and IoT devices.",
  "entryPoint": "dist/index.js",
  "icon": "assets/icon.svg",
  "permissions": [
    "net:http",
    "os:notification",
    "ai:inference"
  ],
  "compatibility": {
    "jarvisMinVersion": "1.0.0",
    "nodeVersion": ">=20.0.0"
  },
  "dependencies": {},
  "license": "MIT"
}
```

---

## 7. Plugin Lifecycle

```
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │ INSTALLATION │────►│ REGISTRATION │────►│ INITIALIZE   │────►│ ACTIVATION   │
  └──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                        │
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
  │ UNINSTALL    │◄────│ SUSPENSION    │◄────│ EXECUTION    │◄───────────┘
  └──────────────┘     └──────────────┘     └──────────────┘
```

1. **Installation**: Download `.jvx` bundle and unpack into `Development/06_Plugins/installed/`.
2. **Registration**: Inspect `manifest.json`, validate security permissions, and register skill schemas with the AI Brain.
3. **Initialization**: Instantiates the sandboxed `WorkerThread` and injects the `PluginContext` API.
4. **Activation**: Calls `onEnable()` hook; plugin registers event listeners and reactive handlers.
5. **Execution**: AI Brain invokes skill methods dynamically in response to user voice or text requests.
6. **Suspension**: Calls `onDisable()` hook on demand or on error; revokes active event listeners.
7. **Uninstallation**: Stops worker execution threads and cleans up stored local settings and assets.

---

## 8. Plugin Context SDK APIs

Plugins interact with JARVIS-X using the typed `PluginContext` injected during initialization:

```typescript
// src/index.ts
import { BasePlugin, PluginContext, SkillResult } from '@jarvis-x/plugin-sdk';

export default class SmartHomePlugin extends BasePlugin {
  async onEnable(context: PluginContext): Promise<void> {
    context.logger.info('Smart Home Plugin activated successfully.');

    // Register a custom voice skill command
    context.skills.register({
      name: 'toggle_living_room_lights',
      description: 'Turns the living room lights on or off.',
      parameters: {
        type: 'object',
        properties: {
          state: { type: 'string', enum: ['on', 'off'] },
        },
        required: ['state'],
      },
      handler: async (args): Promise<SkillResult> => {
        const { state } = args;
        
        // 1. Perform HTTP Request to IoT Bridge (Gated by net:http permission)
        await context.http.post('http://192.168.1.50/api/lights', { state });

        // 2. Trigger Voice Speech Feedback
        await context.voice.speak(`Living room lights turned ${state}.`);

        // 3. Show System Toast Notification
        await context.notifications.show({
          title: 'Smart Home',
          body: `Lights set to ${state}`,
        });

        return { success: true, message: `Lights turned ${state}` };
      },
    });
  }

  async onDisable(context: PluginContext): Promise<void> {
    context.logger.info('Smart Home Plugin suspended.');
  }
}
```

---

## 9. Event System

Plugins can publish and subscribe to system-wide events via the `context.events` bus:

```typescript
// Subscribe to high-priority system telemetry events
context.events.subscribe('system:telemetry', (event) => {
  if (event.payload.cpuUsage > 90) {
    context.logger.warn('High CPU usage detected by plugin monitor.');
  }
});

// Publish a custom plugin event
context.events.publish('plugin:smart-home:motion-detected', {
  location: 'Front Door',
  timestamp: Date.now(),
});
```

---

## 10. Permission Model

JARVIS-X enforces an explicit permission scoping model. Plugins must request capabilities in `manifest.json`:

| Permission Scope | Capability Granted | Risk Level |
| :--- | :--- | :--- |
| `net:http` | Outbound HTTP/HTTPS network requests | Medium |
| `fs:read` | Read access to isolated plugin data directory | Low |
| `fs:write` | Write access to isolated plugin storage | Medium |
| `hardware:mic` | Access microphone audio stream | High (User Prompt Consent) |
| `hardware:camera` | Access camera video frames | High (User Prompt Consent) |
| `os:notification` | Display desktop system notifications | Low |
| `ai:inference` | Direct submission of prompts to local AI Brain | Medium |
| `system:automation`| Schedule background cron automation workflows | High |

---

## 11. Plugin Security & Sandboxing

1. **Memory Isolation**: Plugins execute inside separate Node.js `worker_threads` with strict V8 heap memory limits (default: 128 MB max).
2. **Globals Restriction**: Dangerous global primitives (`process.exit`, `eval`, `child_process`) are removed from the sandboxed global context.
3. **Signature Verification**: Official marketplace plugins must be cryptographically signed via `HMAC-SHA256` keys to prevent tamper injection.

---

## 12. Plugin Testing

Plugins must include unit tests verifying skill handlers using the `@jarvis-x/plugin-testing` mock harness:

```typescript
// tests/plugin.test.ts
import { createMockContext } from '@jarvis-x/plugin-testing';
import SmartHomePlugin from '../src/index';

describe('SmartHomePlugin Unit Tests', () => {
  it('should toggle lights on successfully', async () => {
    const mockContext = createMockContext();
    const plugin = new SmartHomePlugin();
    
    await plugin.onEnable(mockContext);
    
    const result = await mockContext.skills.execute('toggle_living_room_lights', { state: 'on' });
    expect(result.success).toBe(true);
    expect(mockContext.voice.speak).toHaveBeenCalledWith('Living room lights turned on.');
  });
});
```

---

## 13. Packaging & Distribution

Bundle plugins using the JARVIS-X Plugin CLI:

```bash
# Compile TypeScript and package plugin into .jvx file
pnpm exec jvx-cli package

# Output: dist/com.jarvis.plugin.smart-home-1.0.0.jvx
```

---

## 14. Best Practices

1. **Keep Handlers Non-Blocking**: Skill execution handlers must complete under **500ms** to prevent delaying voice or UI response loops.
2. **Clean Up Resources**: Always unsubscribe from event listeners and cancel active timers in `onDisable()`.
3. **Validate Inputs**: Never assume tool argument types are safe; validate using Zod schemas inside skill handlers.

---

## 15. Acceptance Criteria

A plugin is ready for production distribution when:

- [ ] **Manifest Valid**: `manifest.json` satisfies all schema requirements and lists minimal necessary permissions.
- [ ] **Sandboxing Verified**: Plugin executes inside sandboxed `WorkerThread` without violating memory or security constraints.
- [ ] **Test Coverage**: Skill handlers pass unit tests with minimum **80% code coverage**.
- [ ] **Packaging Passed**: `.jvx` bundle packages cleanly via `jvx-cli` and installs cleanly on fresh JARVIS-X instances.

---

## 16. Conclusion

Following this Plugin Development Guide ensures that JARVIS-X remains extensible, modular, and secure. By standardizing manifest declarations, sandboxed runtime execution, permission scoping, and typed SDK APIs, developers can safely expand the capabilities of the AI Operating System.
