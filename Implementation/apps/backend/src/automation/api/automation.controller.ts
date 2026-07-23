import { FastifyRequest, FastifyReply } from 'fastify';
import { executionRuntime } from '../engine/execution.runtime.js';
import { sampleWorkflows } from '../sample/sample-workflows.js';

export class AutomationController {
  async listWorkflows(_req: FastifyRequest, reply: FastifyReply) {
    reply.status(200).send({
      success: true,
      data: sampleWorkflows,
      timestamp: new Date().toISOString(),
    });
  }

  async executeWorkflow(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const targetWorkflow = sampleWorkflows.find((w) => w.id === id) || sampleWorkflows[0]!;

    const result = await executionRuntime.execute(targetWorkflow, (request.body as Record<string, unknown>) || {});

    reply.status(200).send({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  }
}

export const automationController = new AutomationController();
