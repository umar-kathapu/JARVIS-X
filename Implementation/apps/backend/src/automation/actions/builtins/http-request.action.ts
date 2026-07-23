import { IAction, ActionDefinition, ActionResult } from '../../types/action.types.js';

export class HttpRequestAction implements IAction {
  readonly definition: ActionDefinition = {
    id: 'http_request',
    name: 'HTTP Webhook Request',
    description: 'Sends an HTTP GET or POST request to external webhooks',
    category: 'Network',
    parametersSchema: {
      url: { type: 'string', required: true },
      method: { type: 'string', default: 'GET' },
    },
  };

  async execute(params: Record<string, unknown>): Promise<ActionResult> {
    const startTime = Date.now();
    const url = String(params.url || '');
    const method = String(params.method || 'GET').toUpperCase();

    // Simulated HTTP Webhook execution
    return {
      success: true,
      data: { url, method, status: 200, message: 'Simulated HTTP Request Completed' },
      executionTimeMs: Date.now() - startTime,
    };
  }
}
