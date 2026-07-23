import { FastifyInstance } from 'fastify';
import { systemRoutes } from './system.routes.js';
import { authRoutes } from './auth.routes.js';
import { userRoutes } from './user.routes.js';

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  // System root routes (/health, /version, /status, /config)
  await fastify.register(systemRoutes);

  // Versioned API routes (/api/v1/auth, /api/v1/users)
  await fastify.register(
    async (apiV1) => {
      await apiV1.register(authRoutes);
      await apiV1.register(userRoutes);
    },
    { prefix: '/api/v1' },
  );
}
