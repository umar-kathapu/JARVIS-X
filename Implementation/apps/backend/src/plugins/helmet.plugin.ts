import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';

export const helmetPlugin = fp(async (fastify) => {
  await fastify.register(helmet, {
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
  });
});
