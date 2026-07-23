import Fastify, { FastifyInstance } from 'fastify';
import sensible from '@fastify/sensible';
import compress from '@fastify/compress';
import { logger } from './utils/logger.js';
import { corsPlugin } from './plugins/cors.plugin.js';
import { helmetPlugin } from './plugins/helmet.plugin.js';
import { rateLimitPlugin } from './plugins/rate-limit.plugin.js';
import { jwtPlugin } from './plugins/jwt.plugin.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import { registerRoutes } from './routes/index.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false, // Using external Pino logger instance
    disableRequestLogging: false,
  });

  // Register Sensible & Compression plugins
  await app.register(sensible);
  await app.register(compress);

  // Register Security & Auth Plugins
  await app.register(corsPlugin);
  await app.register(helmetPlugin);
  await app.register(rateLimitPlugin);
  await app.register(jwtPlugin);

  // Request logging hook
  app.addHook('onRequest', async (request) => {
    logger.info({ method: request.method, url: request.url }, 'Incoming request');
  });

  // Register API Routes
  await app.register(registerRoutes);

  // Custom 404 & Error Handlers
  app.setNotFoundHandler(notFoundHandler);
  app.setErrorHandler(errorHandler);

  return app;
}
