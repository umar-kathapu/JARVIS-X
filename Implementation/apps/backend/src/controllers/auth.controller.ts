import { FastifyRequest, FastifyReply } from 'fastify';
import { LoginSchema } from '../validators/auth.validator.js';
import { authService } from '../services/auth.service.js';

export class AuthController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const body = LoginSchema.parse(request.body);
    const user = await authService.validateOrSeedUser(body.email, 'Operator User');

    const accessToken = request.server.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = request.server.jwt.sign(
      { id: user.id },
      { expiresIn: '7d' },
    );

    reply.status(200).send({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
      timestamp: new Date().toISOString(),
    });
  }
}

export const authController = new AuthController();
