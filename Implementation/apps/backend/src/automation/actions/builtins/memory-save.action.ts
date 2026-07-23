import { IAction, ActionDefinition, ActionResult } from '../../types/action.types.js';
import { memoryEngine } from '../../../memory/core/memory.engine.js';

export class MemorySaveAction implements IAction {
  readonly definition: ActionDefinition = {
    id: 'memory_save',
    name: 'Save Memory Record',
    description: 'Stores long-term contextual memory',
    category: 'Memory',
    parametersSchema: {
      key: { type: 'string', required: true },
      content: { type: 'string', required: true },
    },
  };

  async execute(params: Record<string, unknown>): Promise<ActionResult> {
    const startTime = Date.now();
    const key = String(params.key || 'workflow_memory');
    const content = String(params.content || '');

    const record = await memoryEngine.remember(key, content, 'LONG_TERM', 0.8, ['automation']);

    return {
      success: true,
      data: record,
      executionTimeMs: Date.now() - startTime,
    };
  }
}
