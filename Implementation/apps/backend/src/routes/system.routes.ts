import { FastifyInstance } from 'fastify';
import { systemController } from '../controllers/system.controller.js';

export async function systemRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/health', systemController.health.bind(systemController));
  fastify.get('/version', systemController.version.bind(systemController));
  fastify.get('/status', systemController.status.bind(systemController));
  fastify.get('/config', systemController.config.bind(systemController));
}
