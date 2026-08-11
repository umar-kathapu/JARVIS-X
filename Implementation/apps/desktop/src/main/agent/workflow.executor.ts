import { ToolExecutionResult } from './agent.types.js';
import { toolRegistry } from './tool.registry.js';
import { securityPolicyService } from './security.policy.js';
import { WorkflowContext } from './workflow.context.js';
import { workflowRecoveryManager } from './workflow.recovery.js';
import {
  WorkflowInstance,
  WorkflowProgressUpdate,
  WorkflowStep,
  WorkflowFinalResult,
} from './workflow.types.js';

export class WorkflowExecutor {
  private activeWorkflows = new Map<string, { cancelled: boolean }>();

  /**
   * Cancels a running workflow instance
   */
  cancelWorkflow(workflowId: string): boolean {
    const active = this.activeWorkflows.get(workflowId);
    if (active) {
      active.cancelled = true;
      return true;
    }
    return false;
  }

  /**
   * Executes a workflow DAG in dependency order with output propagation and authentic verification
   */
  async executeWorkflow(
    workflow: WorkflowInstance,
    onProgress?: (update: WorkflowProgressUpdate) => void,
  ): Promise<WorkflowInstance> {
    workflow.status = 'RUNNING';
    workflow.startedAt = Date.now();

    const cancellationState = { cancelled: false };
    this.activeWorkflows.set(workflow.workflowId, cancellationState);

    const context = new WorkflowContext();

    if (onProgress) {
      onProgress({
        workflowId: workflow.workflowId,
        workflow: { ...workflow },
        isComplete: false,
      });
    }

    // Step Execution Loop in Topological Order
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i]!;

      // 1. Check for Active User Cancellation
      if (cancellationState.cancelled) {
        step.status = 'CANCELLED';
        step.error = 'Workflow cancelled by user.';
        step.verified = false;
        step.completedAt = Date.now();
        continue;
      }

      // 2. Dependency Verification Check
      let isDependencyBlocked = false;
      let blockedPrereqId = '';
      let blockedPrereqError = '';

      if (Array.isArray(step.dependencies) && step.dependencies.length > 0) {
        for (const depId of step.dependencies) {
          const prereqStep = workflow.steps.find((s) => s.stepId === depId);
          if (!prereqStep || prereqStep.status !== 'COMPLETED') {
            isDependencyBlocked = true;
            blockedPrereqId = depId;
            blockedPrereqError =
              prereqStep?.error ||
              prereqStep?.blockedReason ||
              `Prerequisite step '${depId}' status: ${prereqStep?.status || 'NOT_FOUND'}`;
            break;
          }
        }
      }

      if (isDependencyBlocked) {
        step.status = 'BLOCKED';
        step.error = 'DependencyBlocked';
        step.blockedReason = `Blocked: Prerequisite step '${blockedPrereqId}' did not complete successfully (${blockedPrereqError}).`;
        step.completedAt = Date.now();
        step.duration = 0;
        step.durationMs = 0;
        step.verified = false;
        step.evidence = {
          verified: false,
          verificationDetails: step.blockedReason,
        };
        step.result = {
          success: false,
          status: 'BLOCKED',
          tool: step.tool,
          action: 'DEPENDENCY_CHECK',
          parameters: step.input,
          output: step.blockedReason,
          error: 'DependencyBlocked',
          evidence: step.evidence,
        };

        context.setStepResult(step.stepId, step.result, step);

        if (onProgress) {
          onProgress({
            workflowId: workflow.workflowId,
            workflow: { ...workflow },
            currentStepId: step.stepId,
            stepUpdate: { ...step },
            isComplete: false,
          });
        }

        // Continue loop so independent sibling steps can still execute!
        continue;
      }

      // 3. Real Output Propagation from Prerequisites
      const resolvedInput = context.resolveInputs(step);
      step.input = resolvedInput;

      // 4. Security Policy Evaluation
      const secLevel = securityPolicyService.evaluateSecurityLevel(step.tool, resolvedInput);
      step.securityLevel = secLevel;

      if (secLevel === 'BLOCKED') {
        let blockReason = `Security policy blocked tool "${step.tool}" on input parameters.`;
        let errorCode = 'SecurityPolicyBlocked';
        if (step.tool.startsWith('filesystem.')) {
          const pathToCheck = String(resolvedInput.filePath || resolvedInput.targetPath || resolvedInput.resolvedPath || '').trim();
          if (pathToCheck) {
            const check = securityPolicyService.isPathSafe(pathToCheck);
            if (!check.safe) {
              blockReason = `Security Check Blocked: ${check.reason || 'Path traversal blocked'}`;
              errorCode = 'PathTraversalBlocked';
            }
          }
        }

        step.status = 'BLOCKED';
        step.error = errorCode;
        step.blockedReason = blockReason;
        step.completedAt = Date.now();
        step.duration = 0;
        step.durationMs = 0;
        step.verified = false;
        step.evidence = {
          verified: false,
          verificationDetails: step.blockedReason,
        };
        step.result = {
          success: false,
          status: 'BLOCKED',
          tool: step.tool,
          action: 'SECURITY_CHECK',
          parameters: resolvedInput,
          output: step.blockedReason,
          error: errorCode,
          evidence: step.evidence,
        };

        context.setStepResult(step.stepId, step.result, step);

        if (onProgress) {
          onProgress({
            workflowId: workflow.workflowId,
            workflow: { ...workflow },
            currentStepId: step.stepId,
            stepUpdate: { ...step },
            isComplete: false,
          });
        }

        continue;
      }

      // 5. Tool Execution with Bounded Recovery/Retry
      step.status = 'RUNNING';
      step.startedAt = Date.now();

      if (onProgress) {
        onProgress({
          workflowId: workflow.workflowId,
          workflow: { ...workflow },
          currentStepId: step.stepId,
          stepUpdate: { ...step },
          isComplete: false,
        });
      }

      let execResult: ToolExecutionResult;

      try {
        const { result, retryCount } = await workflowRecoveryManager.executeWithRecovery(
          step,
          () => toolRegistry.executeTool(step.tool, resolvedInput),
        );
        execResult = result;
        step.retryCount = retryCount;
      } catch (err: any) {
        execResult = {
          success: false,
          status: 'FAILED',
          tool: step.tool,
          action: 'EXECUTE',
          parameters: resolvedInput,
          output: `Step execution failed with uncaught exception: ${err?.message || String(err)}`,
          error: err?.message || 'ExecutionException',
          evidence: { verified: false, verificationDetails: err?.message || 'Uncaught error' },
        };
      }

      // 6. Record Verified OS Evidence & Lifecycle State
      step.completedAt = Date.now();
      step.duration = Math.max(0, step.completedAt - (step.startedAt || step.completedAt));
      step.durationMs = step.duration;
      step.result = execResult;
      step.output = execResult.output;
      step.evidence = execResult.evidence;
      step.verified = execResult.evidence?.verified ?? (execResult.success ? true : false);
      step.verificationDetails =
        execResult.evidence?.verificationDetails || (execResult.success ? 'Execution verified' : execResult.error);
      step.error = execResult.error;

      if (execResult.success) {
        step.status = 'COMPLETED';
      } else {
        step.status = 'FAILED';
      }

      context.setStepResult(step.stepId, execResult, step);

      if (onProgress) {
        onProgress({
          workflowId: workflow.workflowId,
          workflow: { ...workflow },
          currentStepId: step.stepId,
          stepUpdate: { ...step },
          isComplete: false,
        });
      }
    }

    // 7. Synthesize Truthful Final Workflow Result
    workflow.completedAt = Date.now();
    this.activeWorkflows.delete(workflow.workflowId);

    const finalResult = this.synthesizeFinalResult(workflow);
    workflow.finalResult = finalResult;
    workflow.status = cancellationState.cancelled
      ? 'CANCELLED'
      : finalResult.isSuccess
        ? 'COMPLETED'
        : finalResult.completedSteps > 0
          ? 'PARTIAL'
          : finalResult.failedSteps > 0
            ? 'FAILED'
            : finalResult.blockedSteps > 0
              ? 'BLOCKED'
              : 'FAILED';

    if (onProgress) {
      onProgress({
        workflowId: workflow.workflowId,
        workflow: { ...workflow },
        finalResult,
        isComplete: true,
      });
    }

    return workflow;
  }

  private synthesizeFinalResult(workflow: WorkflowInstance): WorkflowFinalResult {
    let completed = 0;
    let failed = 0;
    let blocked = 0;
    let skipped = 0;
    let cancelled = 0;
    const evidenceList: string[] = [];

    for (const s of workflow.steps) {
      if (s.status === 'COMPLETED') {
        completed++;
        if (s.tool === 'system.check_software' && s.evidence?.verificationDetails) {
          evidenceList.push(`✓ ${s.evidence.verificationDetails}`);
        } else if (s.tool === 'application.launch' && s.evidence?.pid) {
          evidenceList.push(`✓ ${s.description} (PID: ${s.evidence.pid})`);
        } else if (s.tool === 'filesystem.create_directory' && s.evidence?.resolvedPath) {
          evidenceList.push(`✓ Created folder at "${s.evidence.resolvedPath}"`);
        } else if (s.tool === 'filesystem.verify_directory' && s.evidence?.resolvedPath) {
          evidenceList.push(`✓ Verified folder on disk at "${s.evidence.resolvedPath}"`);
        } else if (s.tool === 'screen.capture' && s.evidence?.resolvedPath) {
          evidenceList.push(
            `✓ Screenshot captured: "${s.evidence.resolvedPath}" (${s.evidence.fileSizeBytes} bytes, ${s.evidence.dimensions?.width}x${s.evidence.dimensions?.height})`,
          );
        } else if (s.tool === 'system.run_diagnostics') {
          evidenceList.push(`✓ System diagnostics report compiled successfully`);
        } else if (s.tool === 'browser.search_web' && s.input?.query) {
          evidenceList.push(`✓ Dispatched web search for "${s.input.query}"`);
        } else {
          evidenceList.push(`✓ ${s.description}: COMPLETED`);
        }
      } else if (s.status === 'FAILED') {
        failed++;
        evidenceList.push(`❌ ${s.description}: FAILED (${s.error || 'Execution failed'})`);
      } else if (s.status === 'BLOCKED') {
        blocked++;
        evidenceList.push(`⏸️ ${s.description}: BLOCKED (${s.blockedReason || 'Security or dependency block'})`);
      } else if (s.status === 'CANCELLED') {
        cancelled++;
        evidenceList.push(`⏹️ ${s.description}: CANCELLED`);
      } else if (s.status === 'SKIPPED') {
        skipped++;
      }
    }

    const total = workflow.steps.length;
    const isSuccess = completed === total && total > 0;

    let summary = '';
    if (isSuccess) {
      summary = `WORKFLOW COMPLETED: All ${completed} step(s) executed and verified successfully on system.`;
    } else if (failed > 0 && completed > 0) {
      summary = `WORKFLOW PARTIAL: ${completed} of ${total} step(s) completed; ${failed} failed, ${blocked} blocked.`;
    } else if (failed > 0) {
      summary = `WORKFLOW FAILED: ${failed} step(s) failed, ${blocked} blocked.`;
    } else if (blocked > 0) {
      summary = `WORKFLOW BLOCKED: ${blocked} step(s) blocked by security policy or dependencies.`;
    } else if (cancelled > 0) {
      summary = `WORKFLOW CANCELLED: Execution stopped by user request.`;
    } else {
      summary = `WORKFLOW FINISHED: ${completed} completed.`;
    }

    return {
      summary,
      totalSteps: total,
      completedSteps: completed,
      failedSteps: failed,
      blockedSteps: blocked,
      skippedSteps: skipped,
      cancelledSteps: cancelled,
      evidence: evidenceList,
      isSuccess,
    };
  }
}

export const workflowExecutor = new WorkflowExecutor();
