export type PluginPermissionType =
  | 'FILESYSTEM_READ'
  | 'FILESYSTEM_WRITE'
  | 'INTERNET_ACCESS'
  | 'AI_ACCESS'
  | 'MEMORY_ACCESS'
  | 'AUTOMATION_ACCESS'
  | 'NOTIFICATIONS'
  | 'CLIPBOARD'
  | 'SHELL_EXECUTE'
  | 'WINDOW_CONTROL';

export type PluginCategory =
  | 'PRODUCTIVITY'
  | 'DEVELOPMENT'
  | 'AI_TOOLS'
  | 'AUTOMATION'
  | 'INTEGRATION'
  | 'UTILITY';

export type PluginState = 'UNLOADED' | 'LOADING' | 'ENABLED' | 'DISABLED' | 'ERROR';

export interface PluginManifest {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  license: string;
  category: PluginCategory;
  keywords: string[];
  homepage?: string;
  repository?: string;
  entryPoint: string;
  permissions: PluginPermissionType[];
  minJarvisVersion: string;
  maxJarvisVersion?: string;
  supportedPlatforms: Array<'win32' | 'darwin' | 'linux'>;
  configSchema?: Record<string, unknown>;
}
