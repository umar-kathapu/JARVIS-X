import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import { appConfig } from '../config/app.config.js';

export const rateLimitPlugin = fp(async (fastify) => {
  await fastify.register(rateLimit, {
    max: appConfig.security.rateLimitMax,
    timeWindow: appConfig.security.rateLimitWindowMs,
  });
});
