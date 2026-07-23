# JARVIS-X Plugin Development Guide

## Overview
JARVIS-X provides an enterprise plugin framework enabling third-party developers to extend AI capabilities, memory stores, UI integrations, and workflows safely without modifying the core system.

## 1. Plugin Manifest Specification (`plugin.json`)
Every plugin must contain a valid `plugin.json` manifest:

```json
{
  "id": "my-custom-plugin",
  "name": "My Custom Extension",
  "description": "Adds enterprise feature integrations to JARVIS-X",
  "author": "Developer Name",
  "version": "1.0.0",
  "license": "MIT",
  "category": "PRODUCTIVITY",
  "keywords": ["ai", "productivity"],
  "entryPoint": "index.js",
  "permissions": ["AI_ACCESS", "MEMORY_ACCESS"],
  "minJarvisVersion": "1.0.0",
  "supportedPlatforms": ["win32", "darwin", "linux"]
}
```

## 2. Declaring Granular Permissions
Plugins must explicitly request access to sensitive host capabilities:
- `FILESYSTEM_READ` & `FILESYSTEM_WRITE`
- `INTERNET_ACCESS`
- `AI_ACCESS`
- `MEMORY_ACCESS`
- `AUTOMATION_ACCESS`
- `NOTIFICATIONS`
- `SHELL_EXECUTE`

Undeclared permission requests will throw a `Security Error` inside the runtime sandbox.

## 3. Implementing the Plugin Interface (`IPlugin`)
```typescript
import { IPlugin, PluginContext, PluginAPIBridge } from '@jarvis-x/backend';

export class MyCustomPlugin implements IPlugin {
  readonly manifest = /* Manifest Object */;

  async onEnable(context: PluginContext): Promise<void> {
    const api = new PluginAPIBridge(this.manifest);
    api.logInfo('Plugin initialized successfully');
  }
}
```
