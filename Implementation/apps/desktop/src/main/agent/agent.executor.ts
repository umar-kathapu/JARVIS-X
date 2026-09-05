import {
  AgentExecutionPlan,
  AgentExecutionProgressUpdate,
  ToolExecutionResult,
} from './agent.types.js';
import {
  WorkflowInstance,
  WorkflowProgressUpdate,
} from './workflow.types.js';
import { workflowPlanner } from './workflow.planner.js';
import { workflowExecutor } from './workflow.executor.js';
import { nluService } from './nlu.service.js';
import { dynamicTaskPlanner } from './planner.service.js';
import { toolRegistry } from './tool.registry.js';
import { securityPolicyService } from './security.policy.js';

// Import all built-in agent tools
import {
  ApplicationResolveTool,
  ApplicationLaunchTool,
  ApplicationVerifyTool,
} from './tools/application.tools.js';
import { BrowserOpenUrlTool, BrowserSearchTool } from './tools/browser.tools.js';
import {
  PathResolveTool,
  CheckExistsTool,
  CreateDirectoryTool,
  VerifyDirectoryTool,
  FindFilesTool,
  ReadFileTool,
} from './tools/filesystem.tools.js';
import { SystemMetricsTool, SystemDiagnosticsTool, CheckSoftwareTool } from './tools/system.tools.js';
import { TerminalExecuteTool } from './tools/terminal.tools.js';
import {
  ScreenCaptureTool,
  ScreenVerifyTool,
  ClipboardReadTool,
  ClipboardWriteTool,
  NotificationSendTool,
  MusicScanTool,
} from './tools/native.tools.js';

export class AgentExecutor {
  private isInitialized = false;

  constructor() {
    this.initializeDefaultTools();
  }

  initializeDefaultTools(): void {
    if (this.isInitialized) return;

    // Register all real OS tools
    toolRegistry.registerTool(new ApplicationResolveTool());
    toolRegistry.registerTool(new ApplicationLaunchTool());
    toolRegistry.registerTool(new ApplicationVerifyTool());
    toolRegistry.registerTool(new BrowserOpenUrlTool());
    toolRegistry.registerTool(new BrowserSearchTool());
    toolRegistry.registerTool(new PathResolveTool());
    toolRegistry.registerTool(new CheckExistsTool());
    toolRegistry.registerTool(new CreateDirectoryTool());
    toolRegistry.registerTool(new VerifyDirectoryTool());
    toolRegistry.registerTool(new FindFilesTool());
    toolRegistry.registerTool(new ReadFileTool());
    toolRegistry.registerTool(new SystemMetricsTool());
    toolRegistry.registerTool(new SystemDiagnosticsTool());
    toolRegistry.registerTool(new CheckSoftwareTool());
    toolRegistry.registerTool(new TerminalExecuteTool());
    toolRegistry.registerTool(new ScreenCaptureTool());
    toolRegistry.registerTool(new ScreenVerifyTool());
    toolRegistry.registerTool(new ClipboardReadTool());
    toolRegistry.registerTool(new ClipboardWriteTool());
    toolRegistry.registerTool(new NotificationSendTool());
    toolRegistry.registerTool(new MusicScanTool());

    this.isInitialized = true;
  }

  /**
   * Executes a user's natural language goal end-to-end with real tool execution
   */
  async executeGoal(
    rawGoal: string,
    onProgress?: (update: AgentExecutionProgressUpdate) => void,
  ): Promise<{ plan: AgentExecutionPlan; finalResponse: string }> {
    this.initializeDefaultTools();

    // 1. Natural Language Understanding & Dynamic Planning
    const parsedIntent = nluService.parseGoal(rawGoal);
    const plan = dynamicTaskPlanner.createPlan(parsedIntent);

    // Handle explicitly unsupported capabilities
    if (plan.intent === 'UNSUPPORTED_CAPABILITY' || plan.steps.length === 0) {
      plan.status = 'FAILED';
      const finalResponse = `Unsupported Capability: JARVIS-X cannot execute "${rawGoal}" with available OS capabilities.`;
      if (onProgress) {
        onProgress({
          goalId: plan.goalId,
          plan: { ...plan },
          currentStepIndex: 0,
          finalResponse,
          isComplete: true,
        });
      }
      return { plan, finalResponse };
    }

    plan.status = 'RUNNING';
    if (onProgress) {
      onProgress({
        goalId: plan.goalId,
        plan: { ...plan },
        currentStepIndex: 0,
        isComplete: false,
      });
    }

    let allStepsSucceeded = true;
    let finalResponse = '';
    const stepResults = new Map<number, ToolExecutionResult>();

    // 2. Sequential Step Execution Loop with Dependency & Result Propagation
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i]!;
      step.tool = step.toolName;
      step.input = { ...step.toolArgs };
      step.status = 'RUNNING';
      step.startedAt = Date.now();
      step.startTime = performance.now();

      // Check step dependencies
      if (step.dependsOn && step.dependsOn.length > 0) {
        const failedDep = step.dependsOn.find((depNum) => {
          const depResult = stepResults.get(depNum);
          return !depResult || !depResult.success;
        });

        if (failedDep !== undefined) {
          step.status = 'FAILED';
          step.error = `Prerequisite step ${failedDep} failed.`;
          step.completedAt = Date.now();
          step.endTime = performance.now();
          step.duration = Math.round(step.endTime - step.startTime);
          step.durationMs = step.duration;
          step.verified = false;
          step.verificationDetails = `Prerequisite step ${failedDep} failed`;
          step.evidence = { verified: false, verificationDetails: `Prerequisite step ${failedDep} failed` };
          step.result = {
            success: false,
            status: 'FAILED',
            tool: step.toolName,
            action: 'DEPENDENCY_CHECK',
            parameters: step.toolArgs,
            output: `Cannot execute step ${step.stepNumber}: Prerequisite step ${failedDep} did not complete successfully.`,
            error: 'DependencyFailed',
            evidence: step.evidence,
          };
          allStepsSucceeded = false;

          // Cancel remaining subsequent steps
          for (let j = i + 1; j < plan.steps.length; j++) {
            const s = plan.steps[j]!;
            s.status = 'CANCELLED';
            s.tool = s.toolName;
            s.input = { ...s.toolArgs };
            s.error = 'Cancelled due to prior step failure.';
            s.verified = false;
            s.duration = 0;
            s.durationMs = 0;
          }

          finalResponse = `Task failed on step ${step.stepNumber} (${step.toolName}): Prerequisite step ${failedDep} failed.`;
          break;
        }

        // Result propagation: merge properties from prerequisite steps into current step's toolArgs
        for (const depNum of step.dependsOn) {
          const depResult = stepResults.get(depNum);
          if (depResult?.evidence) {
            const ev = depResult.evidence;
            if (ev.resolvedPath && !step.toolArgs.resolvedPath) {
              step.toolArgs.resolvedPath = ev.resolvedPath;
              step.toolArgs.targetPath = ev.resolvedPath;
              step.toolArgs.filePath = ev.resolvedPath;
            }
            if (ev.pid && !step.toolArgs.pid) {
              step.toolArgs.pid = ev.pid;
            }
            if (ev.url && !step.toolArgs.url) {
              step.toolArgs.url = ev.url;
            }
            if (ev.method && !step.toolArgs.method) {
              step.toolArgs.method = ev.method;
            }
          }
        }
        step.input = { ...step.toolArgs };
      }

      if (onProgress) {
        onProgress({
          goalId: plan.goalId,
          plan: { ...plan },
          currentStepIndex: i,
          stepUpdate: { ...step },
          isComplete: false,
        });
      }

      // Security Policy Evaluation
      const secLevel = securityPolicyService.evaluateSecurityLevel(step.toolName, step.toolArgs);
      step.securityLevel = secLevel;

      if (secLevel === 'BLOCKED') {
        let blockReason = `Security Check Blocked: Action violates security policy.`;
        let errorCode = 'SecurityPolicyBlocked';
        if (step.toolName.startsWith('filesystem.')) {
          const pathToCheck = String(step.toolArgs.filePath || step.toolArgs.targetPath || step.toolArgs.resolvedPath || '').trim();
          if (pathToCheck) {
            const check = securityPolicyService.isPathSafe(pathToCheck);
            if (!check.safe) {
              blockReason = `Security Check Blocked: ${check.reason || 'Path traversal blocked'}`;
              errorCode = 'PathTraversalBlocked';
            }
          }
        }

        step.status = 'FAILED';
        step.completedAt = Date.now();
        step.endTime = performance.now();
        step.duration = Math.round(step.endTime - step.startTime);
        step.durationMs = step.duration;
        step.error = errorCode;
        step.verified = false;
        step.verificationDetails = blockReason;
        step.evidence = {
          verified: false,
          verificationDetails: blockReason,
        };
        step.result = {
          success: false,
          status: 'BLOCKED',
          tool: step.toolName,
          action: 'SECURITY_CHECK',
          parameters: step.toolArgs,
          output: blockReason,
          error: errorCode,
          evidence: step.evidence,
        };
        allStepsSucceeded = false;

        // Cancel remaining steps
        for (let j = i + 1; j < plan.steps.length; j++) {
          const s = plan.steps[j]!;
          s.status = 'CANCELLED';
          s.tool = s.toolName;
          s.input = { ...s.toolArgs };
          s.error = 'Cancelled due to security block.';
          s.verified = false;
          s.duration = 0;
          s.durationMs = 0;
        }

        finalResponse = blockReason;
        break;
      }

      // Real Tool Execution
      const result = await toolRegistry.executeTool(step.toolName, step.toolArgs);
      step.result = result;
      step.output = result.output;
      step.completedAt = Date.now();
      step.endTime = performance.now();
      step.duration = Math.round(step.endTime - step.startTime);
      step.durationMs = step.duration;
      step.evidence = result.evidence;
      step.verified = result.evidence?.verified ?? (result.success ? true : false);
      step.verificationDetails = result.evidence?.verificationDetails || (result.success ? 'Execution verified' : result.error || 'Execution failed');
      step.error = result.error;
      stepResults.set(step.stepNumber, result);

      if (result.success) {
        step.status = 'COMPLETED';
      } else {
        step.status = 'FAILED';
        step.error = result.error || 'ToolExecutionFailed';
        allStepsSucceeded = false;

        // Cancel remaining steps
        for (let j = i + 1; j < plan.steps.length; j++) {
          const s = plan.steps[j]!;
          s.status = 'CANCELLED';
          s.tool = s.toolName;
          s.input = { ...s.toolArgs };
          s.error = 'Cancelled due to prior step failure.';
          s.verified = false;
          s.duration = 0;
          s.durationMs = 0;
        }

        finalResponse = result.output || `Step execution failed on ${step.toolName}`;
        break;
      }

      if (onProgress) {
        onProgress({
          goalId: plan.goalId,
          plan: { ...plan },
          currentStepIndex: i,
          stepUpdate: { ...step },
          isComplete: false,
        });
      }
    }

    // 3. Synthesize Truthful Final Response based on execution outcome
    plan.status = allStepsSucceeded ? 'COMPLETED' : 'FAILED';

    if (allStepsSucceeded) {
      finalResponse = this.formatSuccessResponse(plan);
    }

    if (onProgress) {
      onProgress({
        goalId: plan.goalId,
        plan: { ...plan },
        currentStepIndex: plan.steps.length - 1,
        finalResponse,
        isComplete: true,
      });
    }

    return { plan, finalResponse };
  }

  private formatSuccessResponse(plan: AgentExecutionPlan): string {
    // If there is a screenshot capture step, return the screenshot output
    const screenStep = plan.steps.find((s) => s.toolName === 'screen.capture' && s.result?.output);
    if (screenStep?.result?.output) {
      return screenStep.result.output;
    }

    // If it was an application launch, format application launch summary
    const launchStep = plan.steps.find((s) => s.toolName === 'application.launch' && s.result?.output);
    if (launchStep?.result?.output) {
      return launchStep.result.output;
    }

    // Diagnostics / System report
    const diagStep = plan.steps.find((s) => s.toolName === 'system.run_diagnostics' && s.result?.output);
    if (diagStep?.result?.output) {
      return diagStep.result.output;
    }

    // Find files report
    const findStep = plan.steps.find((s) => s.toolName === 'filesystem.find_files' && s.result?.output);
    if (findStep?.result?.output) {
      return findStep.result.output;
    }

    // Directory creation report
    const createDirStep = plan.steps.find((s) => s.toolName === 'filesystem.create_directory' && s.result?.output);
    if (createDirStep?.result?.output) {
      return createDirStep.result.output;
    }

    const outputs = plan.steps.map((s) => s.result?.output).filter(Boolean);
    if (outputs.length === 1) {
      return outputs[0] || 'Goal completed successfully.';
    }
    return `Completed ${plan.steps.length} execution step(s) for "${plan.rawGoal}":\n${outputs.join('\n')}`;
  }

  /**
   * Executes an autonomous multi-step workflow with dependency graph resolution
   */
  async executeWorkflow(
    workflowOrGoal: string | WorkflowInstance,
    onProgress?: (update: WorkflowProgressUpdate) => void,
  ): Promise<WorkflowInstance> {
    this.initializeDefaultTools();
    const workflow =
      typeof workflowOrGoal === 'string'
        ? workflowPlanner.planWorkflow(workflowOrGoal)
        : workflowOrGoal;

    return workflowExecutor.executeWorkflow(workflow, onProgress);
  }

  /**
   * Cancels a running workflow instance
   */
  cancelWorkflow(workflowId: string): boolean {
    return workflowExecutor.cancelWorkflow(workflowId);
  }
}

export const agentExecutor = new AgentExecutor();
