export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: {
    total: number;
    free: number;
    used: number;
  };
  uptime: number;
  platform: string;
  arch: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  services: {
    database: boolean;
    redis?: boolean;
    aiEngine: boolean;
  };
}
