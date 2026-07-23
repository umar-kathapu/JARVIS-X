import { FastifyInstance } from 'fastify';
import { authController } from '../controllers/auth.controller.js';

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/auth/login', authController.login.bind(authController));
}
