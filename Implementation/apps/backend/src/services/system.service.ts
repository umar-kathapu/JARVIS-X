import os from 'os';
import { prisma } from '../database/prisma.js';
import { isRedisConnected } from '../database/redis.js';
import { appConfig } from '../config/app.config.js';

export class SystemService {
  async getHealthStatus() {
    let dbStatus = false;
    let redisStatus = false;

    try {
      const dbPromise = prisma.$queryRaw`SELECT 1`;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB Timeout')), 80),
      );
      await Promise.race([dbPromise, timeoutPromise]);
      dbStatus = true;
    } catch {
      dbStatus = false;
    }

    redisStatus = isRedisConnected();


    return {
      status: dbStatus ? 'healthy' : 'degraded',
      service: appConfig.name,
      version: appConfig.version,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      dependencies: {
        database: dbStatus,
        redis: redisStatus,
      },
    };
  }

  getVersionInfo() {
    return {
      name: appConfig.name,
      version: appConfig.version,
      apiVersion: appConfig.apiVersion,
      environment: appConfig.env,
      nodeVersion: process.version,
    };
  }

  getSystemStatus() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      status: 'OPERATIONAL',
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpuCores: os.cpus().length,
        memory: {
          totalMb: Math.round(totalMem / 1024 / 1024),
          usedMb: Math.round(usedMem / 1024 / 1024),
          freeMb: Math.round(freeMem / 1024 / 1024),
          usagePercentage: Math.round((usedMem / totalMem) * 100),
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  getApplicationConfig() {
    return {
      name: appConfig.name,
      version: appConfig.version,
      environment: appConfig.env,
      port: appConfig.port,
      rateLimitWindowMs: appConfig.security.rateLimitWindowMs,
      rateLimitMax: appConfig.security.rateLimitMax,
    };
  }
}

export const systemService = new SystemService();
