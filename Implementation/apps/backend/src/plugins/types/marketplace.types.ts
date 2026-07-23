import { PluginManifest } from './manifest.types.js';

export interface MarketplacePlugin {
  manifest: PluginManifest;
  downloadUrl: string;
  downloadsCount: number;
  rating: number; // 0.0 to 5.0
  reviewCount: number;
  signature: string; // Digital signature
  publishedAt: string;
  updatedAt: string;
}

export interface PluginReview {
  id: string;
  pluginId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
