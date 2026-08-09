import { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';
import { appConfig } from './config/app.config.js';
import { connectPrisma, disconnectPrisma } from './database/prisma.js';
import { connectRedis, disconnectRedis } from './database/redis.js';
import { cronScheduler } from './automation/scheduler/cron.scheduler.js';
import { jobQueue } from './automation/queue/job.queue.js';
import { logger } from './utils/logger.js';

let appInstance: FastifyInstance | null = null;
let isShuttingDown = false;

/**
 * Executes a deterministic, graceful shutdown sequence across all application resources.
 * Guarantees idempotency (prevents duplicate execution if multiple signals trigger).
 */
export async function gracefulShutdown(reason: string, exitCode = 0): Promise<void> {
  if (isShuttingDown) {
    logger.warn({ reason }, 'Shutdown already in progress. Ignoring duplicate trigger.');
    return;
  }

  isShuttingDown = true;
  logger.info({ reason, exitCode }, `🛑 Initiating application shutdown sequence [Reason: ${reason}]...`);

  const forceTimeout = setTimeout(() => {
    logger.error('⚠️ Shutdown timeout exceeded (10s). Forcing process exit.');
    process.exit(exitCode !== 0 ? exitCode : 1);
  }, 10000);

  try {
    // 1. Stop Fastify HTTP server listener from accepting new requests
    if (appInstance) {
      logger.info('Closing Fastify HTTP server connections...');
      await appInstance.close();
      logger.info('✅ Fastify HTTP server closed.');
    }

    // 2. Stop Background Workers, Schedulers & Draining Queues
    logger.info('Stopping background automation schedulers & job queues...');
    cronScheduler.stopScheduler();
    jobQueue.clear();
    logger.info('✅ Background tasks stopped.');

    // 3. Disconnect Caching & Message Layer (Redis)
    logger.info('Disconnecting Redis client...');
    await disconnectRedis();
    logger.info('✅ Redis client disconnected.');

    // 4. Disconnect Relational Database Connection Pool (Prisma / PostgreSQL)
    logger.info('Closing PostgreSQL Prisma connection pool...');
    await disconnectPrisma();
    logger.info('✅ Prisma connection pool closed.');

    clearTimeout(forceTimeout);
    logger.info({ exitCode }, '🎉 Graceful shutdown completed cleanly. Process exiting.');
    process.exit(exitCode);
  } catch (err) {
    clearTimeout(forceTimeout);
    logger.error({ err }, '❌ Error encountered during shutdown sequence.');
    process.exit(1);
  }
}

/**
 * Registers process-level handlers for uncaught exceptions and unhandled promise rejections.
 */
function registerProcessErrorHandlers(): void {
  process.on('uncaughtException', (error: Error) => {
    logger.fatal(
      { err: error, stack: error.stack },
      '🔥 FATAL ERROR: Uncaught Exception detected in Node.js process.',
    );
    gracefulShutdown('UNCAUGHT_EXCEPTION', 1);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    logger.fatal(
      { err: reason },
      '🔥 FATAL ERROR: Unhandled Promise Rejection detected in Node.js process.',
    );
    gracefulShutdown('UNHANDLED_REJECTION', 1);
  });

  process.on('SIGINT', () => {
    gracefulShutdown('SIGINT', 0);
  });

  process.on('SIGTERM', () => {
    gracefulShutdown('SIGTERM', 0);
  });
}

export async function startServer(): Promise<FastifyInstance> {
  try {
    // 1. Register Global Process Error & Signal Handlers
    registerProcessErrorHandlers();

    // 2. Connect to Infrastructure Dependencies
    logger.info('Connecting to PostgreSQL database...');
    await connectPrisma();

    logger.info('Connecting to Redis caching layer...');
    await connectRedis();

    // 3. Start Background Schedulers
    cronScheduler.startScheduler();

    // 4. Build Fastify App Instance
    appInstance = await buildApp();

    // 5. Start Server Listener
    const address = await appInstance.listen({
      port: appConfig.port,
      host: appConfig.host,
    });

    logger.info(`🚀 Fastify Backend Server running cleanly at: ${address} [ENV: ${appConfig.env}]`);

    return appInstance;
  } catch (error) {
    logger.error({ err: error }, '❌ Critical failure during server startup.');
    process.exit(1);
  }
}
