import { AgentPlan } from '../types/agent.types.js';
import { toolRegistry } from '../tools/registry.js';
import { logger } from '../../utils/logger.js';

export class ReasoningEngine {
  async executePlan(plan: AgentPlan): Promise<string> {
    logger.info(`Executing autonomous plan for goal: "${plan.goal}"`);
    const outputs: string[] = [];

    for (const step of plan.steps) {
      step.status = 'RUNNING';
      logger.info(`Running Step #${step.stepNumber}: ${step.description}`);

      if (step.toolName && step.toolArgs) {
        try {
          const toolResult = await toolRegistry.executeTool(step.toolName, step.toolArgs);
          step.result = toolResult;
          step.status = 'SUCCESS';
          outputs.push(`Step ${step.stepNumber}: ${toolResult}`);
        } catch (err) {
          step.status = 'FAILED';
          step.result = String(err);
          outputs.push(`Step ${step.stepNumber} Failed: ${err}`);
        }
      } else {
        step.status = 'SUCCESS';
        step.result = 'Step processed successfully';
        outputs.push(`Step ${step.stepNumber}: Completed`);
      }
    }

    return `Plan execution finished for '${plan.goal}':\n${outputs.join('\n')}`;
  }
}

export const reasoningEngine = new ReasoningEngine();
