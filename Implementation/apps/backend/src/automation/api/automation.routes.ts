import { FastifyInstance } from 'fastify';
import { automationController } from './automation.controller.js';

export async function automationRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/automations/workflows', automationController.listWorkflows.bind(automationController));
  fastify.post('/automations/workflows/:id/execute', automationController.executeWorkflow.bind(automationController));
}
