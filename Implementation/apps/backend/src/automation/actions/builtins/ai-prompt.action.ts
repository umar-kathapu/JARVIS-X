import { IAction, ActionDefinition, ActionResult } from '../../types/action.types.js';
import { aiEngine } from '../../../ai/core/ai.engine.js';

export class AIPromptAction implements IAction {
  readonly definition: ActionDefinition = {
    id: 'ai_prompt',
    name: 'AI Prompt Execution',
    description: 'Generates LLM text completions via AI Core Engine',
    category: 'AI',
    parametersSchema: {
      prompt: { type: 'string', required: true },
    },
  };

  async execute(params: Record<string, unknown>): Promise<ActionResult> {
    const startTime = Date.now();
    const promptText = String(params.prompt || '');

    const response = await aiEngine.chat([
      { role: 'user', content: promptText },
    ]);

    return {
      success: true,
      data: response.content,
      executionTimeMs: Date.now() - startTime,
    };
  }
}
