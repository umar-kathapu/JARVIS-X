import fp from 'fastify-plugin';
import cors, { FastifyCorsOptions } from '@fastify/cors';
import { appConfig } from '../config/app.config.js';
import { logger } from '../utils/logger.js';

export const corsPlugin = fp<FastifyCorsOptions>(async (fastify) => {
  const isProduction = appConfig.env === 'production';
  let allowedOrigins: (string | RegExp)[] = appConfig.cors.origin;

  // Security Hardening for Production CORS Settings
  if (isProduction) {
    const hasWildcard = allowedOrigins.some((o) => typeof o === 'string' && o.trim() === '*');
    if (hasWildcard && appConfig.cors.credentials) {
      logger.warn(
        '⚠️ CORS Security Warning: Wildcard origin "*" with credentials: true is unsafe in production. Restricting allowed origins.',
      );
      // Remove wildcard in production when credentials are true
      allowedOrigins = allowedOrigins.filter((o) => typeof o === 'string' && o.trim() !== '*');
    }
  }

  await fastify.register(cors, {
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    credentials: appConfig.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['X-Total-Count', 'X-Response-Time'],
    maxAge: 86400, // 24 hours preflight cache
  });

  logger.info({ origins: allowedOrigins }, '🔒 CORS Security plugin initialized.');
});
