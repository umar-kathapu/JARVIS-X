import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply): void {
  logger.error(
    {
      err: error,
      url: request.raw.url,
      method: request.raw.method,
    },
    'Global request processing error',
  );

  // Handle Zod Validation Errors
  if (error instanceof ZodError) {
    reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request payload validation failed',
        details: error.errors,
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle Fastify Validation Errors
  if (error.validation) {
    reply.status(400).send({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: error.message,
        details: error.validation,
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle Default HTTP Error status
  const statusCode = error.statusCode || 500;
  reply.status(statusCode).send({
    success: false,
    error: {
      code: statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'API_ERROR',
      message: statusCode === 500 ? 'An unexpected error occurred on the server' : error.message,
    },
    timestamp: new Date().toISOString(),
  });
}
