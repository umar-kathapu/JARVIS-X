import { FastifyInstance } from 'fastify';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/rbac.middleware.js';

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get(
    '/users',
    { preHandler: [authenticate, authorizeRoles(['ADMIN'])] },
    userController.listUsers.bind(userController),
  );

  fastify.get(
    '/users/me',
    { preHandler: [authenticate] },
    userController.getCurrentUser.bind(userController),
  );
}
