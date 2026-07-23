import { AgentPlan, TaskStep } from '../types/agent.types.js';

export class TaskPlanner {
  createPlan(goal: string): AgentPlan {
    const steps: TaskStep[] = [
      {
        stepNumber: 1,
        description: `Analyze objective: "${goal}"`,
        status: 'PENDING',
      },
      {
        stepNumber: 2,
        description: 'Gather context and query vector knowledge base',
        toolName: 'web_search',
        toolArgs: { query: goal },
        status: 'PENDING',
      },
      {
        stepNumber: 3,
        description: 'Synthesize final goal response',
        status: 'PENDING',
      },
    ];

    return {
      goal,
      steps,
      estimatedTimeMs: 3000,
    };
  }
}

export const taskPlanner = new TaskPlanner();
