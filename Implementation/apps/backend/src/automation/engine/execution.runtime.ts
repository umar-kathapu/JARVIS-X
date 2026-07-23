import { WorkflowDefinition, ExecutionResult, ExecutionContext } from '../types/workflow.types.js';
import { workflowCompiler } from './workflow.compiler.js';
import { actionRegistry } from '../actions/action.registry.js';
import { logger } from '../../utils/logger.js';

export class ExecutionRuntime {
  async execute(workflow: WorkflowDefinition, initialVariables: Record<string, unknown> = {}): Promise<ExecutionResult> {
    const startTime = Date.now();
    const executionId = `exec_${Date.now()}`;
    const compiledNodes = workflowCompiler.compile(workflow);

    const context: ExecutionContext = {
      workflowId: workflow.id,
      executionId,
      variables: { ...initialVariables },
      nodeResults: {},
      logs: [],
    };

    logger.info(`Starting execution runtime for workflow '${workflow.name}' (${executionId})`);

    try {
      for (const node of compiledNodes) {
        if (node.type === 'TRIGGER') {
          context.nodeResults[node.id] = { status: 'TRIGGERED', timestamp: new Date().toISOString() };
          continue;
        }

        if (node.type === 'CONDITION') {
          const conditionPassed = Boolean(node.parameters.condition);
          context.nodeResults[node.id] = { passed: conditionPassed };
          if (!conditionPassed) break;
          continue;
        }

        const action = actionRegistry.getAction(node.actionOrTriggerId);
        if (action) {
          logger.info(`Executing node '${node.name}' using action '${action.definition.id}'`);
          const result = await action.execute(node.parameters, context.variables);
          context.nodeResults[node.id] = result;
        }
      }

      return {
        executionId,
        workflowId: workflow.id,
        status: 'SUCCESS',
        nodeResults: context.nodeResults,
        durationMs: Date.now() - startTime,
      };
    } catch (err) {
      logger.error({ error: err, workflowId: workflow.id }, `Workflow execution failed`);
      return {
        executionId,
        workflowId: workflow.id,
        status: 'FAILED',
        nodeResults: context.nodeResults,
        errorMessage: String(err),
        durationMs: Date.now() - startTime,
      };
    }
  }
}

export const executionRuntime = new ExecutionRuntime();
