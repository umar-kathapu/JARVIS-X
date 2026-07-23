import { FastifyRequest, FastifyReply } from 'fastify';

export function notFoundHandler(request: FastifyRequest, reply: FastifyReply): void {
  reply.status(404).send({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${request.method}:${request.url} not found`,
    },
    timestamp: new Date().toISOString(),
  });
}
