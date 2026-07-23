import { FastifyRequest, FastifyReply } from 'fastify';
import { systemService } from '../services/system.service.js';

export class SystemController {
  async health(_req: FastifyRequest, reply: FastifyReply) {
    const data = await systemService.getHealthStatus();
    reply.status(200).send({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  async version(_req: FastifyRequest, reply: FastifyReply) {
    const data = systemService.getVersionInfo();
    reply.status(200).send({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  async status(_req: FastifyRequest, reply: FastifyReply) {
    const data = systemService.getSystemStatus();
    reply.status(200).send({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  async config(_req: FastifyRequest, reply: FastifyReply) {
    const data = systemService.getApplicationConfig();
    reply.status(200).send({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }
}

export const systemController = new SystemController();
