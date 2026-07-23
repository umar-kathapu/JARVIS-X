export interface AgentRequestPayload {
  agentId: string;
  prompt: string;
  context?: Record<string, unknown>;
}

export interface AgentResponsePayload {
  taskId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  output?: string;
  executionTimeMs: number;
}

export interface IAgentOrchestrator {
  executeTask(payload: AgentRequestPayload): Promise<AgentResponsePayload>;
}
