import { ToolExecutionResult } from './agent.types.js';
import { WorkflowStep } from './workflow.types.js';

export class WorkflowRecoveryManager {
  // Explicitly non-retryable error types
  private static NON_RETRYABLE_ERRORS = new Set([
    'SecurityPolicyBlocked',
    'PathTraversalBlocked',
    'ApplicationNotFound',
    'FileNotFound',
    'DirectoryNotFound',
    'UnsupportedCapability',
  ]);

  // Explicitly retryable tool actions (non-destructive operations only)
  private static RETRYABLE_TOOLS = new Set([
    'application.launch',
    'screen.capture',
    'system.get_metrics',
    'browser.open_url',
    'browser.search_web',
  ]);

  /**
   * Determines whether a failed step is eligible for controlled recovery
   */
  shouldRetry(step: WorkflowStep, result: ToolExecutionResult): boolean {
    if (result.success) return false;

    // Never retry security rejections or missing targets
    if (result.error && WorkflowRecoveryManager.NON_RETRYABLE_ERRORS.has(result.error)) {
      return false;
    }

    // Check step explicit flag or tool whitelist
    const isToolRetryable =
      step.retryable ?? WorkflowRecoveryManager.RETRYABLE_TOOLS.has(step.tool);
    if (!isToolRetryable) {
      return false;
    }

    const currentRetries = step.retryCount ?? 0;
    const maxRetries = step.maxRetries ?? 1;

    return currentRetries < maxRetries;
  }

  /**
   * Executes a step with bounded recovery attempt
   */
  async executeWithRecovery(
    step: WorkflowStep,
    executeFn: () => Promise<ToolExecutionResult>,
  ): Promise<{ result: ToolExecutionResult; retryCount: number }> {
    let attempts = 0;
    let result = await executeFn();
    attempts++;

    while (this.shouldRetry(step, result)) {
      step.retryCount = (step.retryCount ?? 0) + 1;

      // Small backoff before retry
      await new Promise((resolve) => setTimeout(resolve, 150));

      result = await executeFn();
      attempts++;

      if (result.evidence) {
        result.evidence.retryCount = step.retryCount;
        result.evidence.attempts = attempts;
      }
    }

    return { result, retryCount: step.retryCount ?? 0 };
  }
}

export const workflowRecoveryManager = new WorkflowRecoveryManager();
