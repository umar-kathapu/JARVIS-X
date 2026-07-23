export interface TaskStep {
  stepNumber: number;
  description: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  result?: string;
}

export interface AgentPlan {
  goal: string;
  steps: TaskStep[];
  estimatedTimeMs?: number;
}

export interface ReasoningStep {
  thought: string;
  action?: string;
  actionInput?: Record<string, unknown>;
  observation?: string;
}
