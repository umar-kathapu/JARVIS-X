import { FastifyRequest, FastifyReply } from 'fastify';
import { Role } from '../types/auth.types.js';

export function authorizeRoles(allowedRoles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user as { role: Role } | undefined;

    if (!user || !allowedRoles.includes(user.role)) {
      reply.status(403).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions for this resource',
        },
        timestamp: new Date().toISOString(),
      });
    }
  };
}
