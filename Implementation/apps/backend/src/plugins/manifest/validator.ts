import { z } from 'zod';
import { PluginManifest } from '../types/manifest.types.js';

export const PluginManifestSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, 'Plugin ID must be lowercase alphanumeric with hyphens'),
  name: z.string().min(2).max(50),
  description: z.string().min(5).max(300),
  author: z.string().min(2),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must follow semver format (x.y.z)'),
  license: z.string().default('MIT'),
  category: z.enum(['PRODUCTIVITY', 'DEVELOPMENT', 'AI_TOOLS', 'AUTOMATION', 'INTEGRATION', 'UTILITY']),
  keywords: z.array(z.string()).default([]),
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
  entryPoint: z.string().min(1),
  permissions: z.array(
    z.enum([
      'FILESYSTEM_READ',
      'FILESYSTEM_WRITE',
      'INTERNET_ACCESS',
      'AI_ACCESS',
      'MEMORY_ACCESS',
      'AUTOMATION_ACCESS',
      'NOTIFICATIONS',
      'CLIPBOARD',
      'SHELL_EXECUTE',
      'WINDOW_CONTROL',
    ]),
  ),
  minJarvisVersion: z.string().default('1.0.0'),
  maxJarvisVersion: z.string().optional(),
  supportedPlatforms: z.array(z.enum(['win32', 'darwin', 'linux'])).default(['win32', 'darwin', 'linux']),
  configSchema: z.record(z.unknown()).optional(),
});

export function validatePluginManifest(raw: unknown): PluginManifest {
  return PluginManifestSchema.parse(raw) as PluginManifest;
}
