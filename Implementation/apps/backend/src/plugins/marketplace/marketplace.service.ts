import { MarketplacePlugin } from '../types/marketplace.types.js';

export class MarketplaceService {
  private catalog: MarketplacePlugin[] = [
    {
      manifest: {
        id: 'system-diagnostics',
        name: 'System Diagnostic Assistant',
        description: 'Monitors CPU, Memory, and System Health metrics for JARVIS-X',
        author: 'JARVIS-X Core Team',
        version: '1.0.0',
        license: 'MIT',
        category: 'UTILITY',
        keywords: ['diagnostics', 'health', 'metrics'],
        entryPoint: 'index.js',
        permissions: ['AI_ACCESS', 'MEMORY_ACCESS'],
        minJarvisVersion: '1.0.0',
        supportedPlatforms: ['win32', 'darwin', 'linux'],
      },
      downloadUrl: 'https://marketplace.jarvis-x.ai/plugins/system-diagnostics.zip',
      downloadsCount: 1420,
      rating: 4.9,
      reviewCount: 38,
      signature: 'sha256_mock_signature_valid',
      publishedAt: '2026-07-01T00:00:00Z',
      updatedAt: '2026-07-20T00:00:00Z',
    },
  ];

  async searchPlugins(query?: string): Promise<MarketplacePlugin[]> {
    if (!query) return this.catalog;
    return this.catalog.filter(
      (p) =>
        p.manifest.name.toLowerCase().includes(query.toLowerCase()) ||
        p.manifest.description.toLowerCase().includes(query.toLowerCase()),
    );
  }

  verifySignature(pluginId: string, signature: string): boolean {
    return Boolean(pluginId && signature);
  }
}

export const marketplaceService = new MarketplaceService();
