import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { appConfig } from '../config/app.config.js';

export const jwtPlugin = fp(async (fastify) => {
  await fastify.register(jwt, {
    secret: appConfig.security.jwtSecret,
  });
});
