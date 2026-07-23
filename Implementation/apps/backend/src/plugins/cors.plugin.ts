import fp from 'fastify-plugin';
import cors, { FastifyCorsOptions } from '@fastify/cors';
import { appConfig } from '../config/app.config.js';

export const corsPlugin = fp<FastifyCorsOptions>(async (fastify) => {
  await fastify.register(cors, {
    origin: appConfig.cors.origin,
    credentials: appConfig.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
});
