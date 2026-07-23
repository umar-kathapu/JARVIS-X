import { buildApp } from './app.js';
import { appConfig } from './config/app.config.js';
import { connectPrisma, disconnectPrisma } from './database/prisma.js';
import { connectRedis, disconnectRedis } from './database/redis.js';
import { logger } from './utils/logger.js';

export async function startServer() {
  try {
    // 1. Connect to Infrastructure Dependencies
    await connectPrisma();
    await connectRedis();

    // 2. Build Fastify App Instance
    const app = await buildApp();

    // 3. Start Server Listener
    const address = await app.listen({
      port: appConfig.port,
      host: appConfig.host,
    });

    logger.info(`🚀 Fastify Backend Server running at: ${address}`);

    // Graceful Shutdown Signals Handler
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Initiating graceful shutdown...`);
      await app.close();
      await disconnectRedis();
      await disconnectPrisma();
      logger.info('Graceful shutdown completed successfully.');
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    return app;
  } catch (error) {
    logger.error({ error }, '❌ Server startup failure');
    process.exit(1);
  }
}
