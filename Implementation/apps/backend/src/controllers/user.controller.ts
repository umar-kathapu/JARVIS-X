import { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from '../services/user.service.js';

export class UserController {
  async listUsers(_req: FastifyRequest, reply: FastifyReply) {
    const users = await userService.getAllUsers();
    reply.status(200).send({
      success: true,
      data: users,
      timestamp: new Date().toISOString(),
    });
  }

  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    const userPayload = request.user as { id: string };
    const user = await userService.getUserById(userPayload.id);

    if (!user) {
      reply.status(404).send({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User profile not found' },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    reply.status(200).send({
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    });
  }
}

export const userController = new UserController();
