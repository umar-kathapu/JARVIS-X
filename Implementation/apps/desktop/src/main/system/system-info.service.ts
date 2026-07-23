import os from 'os';
import { SystemMetrics } from '../types/desktop.types.js';

export class SystemInfoService {
  getMetrics(): SystemMetrics {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // Estimate CPU usage percentage based on load averages
    const loadAvg = os.loadavg()[0] || 0;
    const cpuCores = os.cpus().length || 1;
    const cpuUsagePercentage = Math.min(100, Math.round((loadAvg / cpuCores) * 100));

    return {
      cpuUsagePercentage,
      totalMemoryMb: Math.round(totalMem / 1024 / 1024),
      usedMemoryMb: Math.round(usedMem / 1024 / 1024),
      freeMemoryMb: Math.round(freeMem / 1024 / 1024),
      platform: os.platform(),
      arch: os.arch(),
      uptimeSeconds: Math.floor(os.uptime()),
    };
  }
}

export const systemInfoService = new SystemInfoService();
