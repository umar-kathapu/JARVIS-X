import {
  AgentExecutionPlan,
  AgentExecutionProgressUpdate,
} from './agent.types.js';
import { nluService } from './nlu.service.js';
import { dynamicTaskPlanner } from './planner.service.js';
import { toolRegistry } from './tool.registry.js';
import { securityPolicyService } from './security.policy.js';

// Import all built-in agent tools
import { ApplicationLaunchTool } from './tools/application.tools.js';
import { BrowserOpenUrlTool, BrowserSearchTool } from './tools/browser.tools.js';
import { CreateDirectoryTool, FindFilesTool, ReadFileTool } from './tools/filesystem.tools.js';
import { SystemMetricsTool, SystemDiagnosticsTool, CheckSoftwareTool } from './tools/system.tools.js';
import { TerminalExecuteTool } from './tools/terminal.tools.js';
import {
  ScreenCaptureTool,
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
    toolRegistry.registerTool(new ApplicationLaunchTool());
    toolRegistry.registerTool(new BrowserOpenUrlTool());
    toolRegistry.registerTool(new BrowserSearchTool());
    toolRegistry.registerTool(new CreateDirectoryTool());
    toolRegistry.registerTool(new FindFilesTool());
    toolRegistry.registerTool(new ReadFileTool());
    toolRegistry.registerTool(new SystemMetricsTool());
    toolRegistry.registerTool(new SystemDiagnosticsTool());
    toolRegistry.registerTool(new CheckSoftwareTool());
    toolRegistry.registerTool(new TerminalExecuteTool());
    toolRegistry.registerTool(new ScreenCaptureTool());
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

    // 2. Sequential Step Execution Loop
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i]!;
      step.status = 'RUNNING';
      step.startTime = performance.now();

      if (onProgress) {
        onProgress({
          goalId: plan.goalId,
          plan: { ...plan },
          currentStepIndex: i,
          stepUpdate: { ...step },
          isComplete: false,
        });
      }

      // Security Check
      const secLevel = securityPolicyService.evaluateSecurityLevel(step.toolName, step.toolArgs);
      step.securityLevel = secLevel;

      if (secLevel === 'BLOCKED') {
        step.status = 'BLOCKED';
        step.endTime = performance.now();
        step.durationMs = Math.round(step.endTime - (step.startTime || step.endTime));
        step.result = {
          success: false,
          status: 'BLOCKED',
          tool: step.toolName,
          action: 'SECURITY_CHECK',
          parameters: step.toolArgs,
          output: 'Operation was blocked by JARVIS-X security policy.',
          error: 'SecurityPolicyBlocked',
          evidence: {
            verified: false,
            verificationDetails: 'Action violates safety policy',
          },
        };
        allStepsSucceeded = false;
        finalResponse = `Operation blocked: Security policy restricted "${step.toolName}".`;
        break;
      }

      // Real Tool Execution
      const result = await toolRegistry.executeTool(step.toolName, step.toolArgs);
      step.result = result;
      step.endTime = performance.now();
      step.durationMs = Math.round(step.endTime - (step.startTime || step.endTime));

      if (result.success) {
        step.status = 'COMPLETED';
      } else {
        step.status = 'FAILED';
        allStepsSucceeded = false;
        finalResponse = `Step execution failed on ${step.toolName}: ${result.output}`;
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
    const outputs = plan.steps.map((s) => s.result?.output).filter(Boolean);
    if (outputs.length === 1) {
      return outputs[0] || 'Goal completed successfully.';
    }
    return `Completed ${plan.steps.length} execution step(s) for "${plan.rawGoal}":\n${outputs.join('\n')}`;
  }
}

export const agentExecutor = new AgentExecutor();
