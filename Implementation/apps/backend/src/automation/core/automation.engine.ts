import { WorkflowDefinition, ExecutionResult } from '../types/workflow.types.js';
import { executionRuntime } from '../engine/execution.runtime.js';
import { actionRegistry } from '../actions/action.registry.js';
import { AIPromptAction } from '../actions/builtins/ai-prompt.action.js';
import { MemorySaveAction } from '../actions/builtins/memory-save.action.js';
import { HttpRequestAction } from '../actions/builtins/http-request.action.js';
import { TerminalAction } from '../actions/builtins/terminal.action.js';
import { NotificationAction } from '../actions/builtins/notification.action.js';
import { jobQueue } from '../queue/job.queue.js';
import { cronScheduler } from '../scheduler/cron.scheduler.js';
import { logger } from '../../utils/logger.js';

export class AutomationEngine {
  private static instance: AutomationEngine;

  private constructor() {
    // Register default built-in actions
    actionRegistry.registerAction(new AIPromptAction());
    actionRegistry.registerAction(new MemorySaveAction());
    actionRegistry.registerAction(new HttpRequestAction());
    actionRegistry.registerAction(new TerminalAction());
    actionRegistry.registerAction(new NotificationAction());

    cronScheduler.startScheduler();
    logger.info('⚡ JARVIS-X Automation & Workflow Engine initialized');
  }

  public static getInstance(): AutomationEngine {
    if (!AutomationEngine.instance) {
      AutomationEngine.instance = new AutomationEngine();
    }
    return AutomationEngine.instance;
  }

  async executeWorkflow(workflow: WorkflowDefinition, variables: Record<string, unknown> = {}): Promise<ExecutionResult> {
    return executionRuntime.execute(workflow, variables);
  }

  enqueueJob(workflowId: string, payload: unknown) {
    return jobQueue.enqueue(workflowId, payload);
  }
}

export const automationEngine = AutomationEngine.getInstance();
