import { ToolExecutionResult } from './agent.types.js';
import { WorkflowStep } from './workflow.types.js';

export class WorkflowContext {
  private results = new Map<string, ToolExecutionResult>();
  private steps = new Map<string, WorkflowStep>();
  private variables = new Map<string, unknown>();

  setStepResult(stepId: string, result: ToolExecutionResult, step: WorkflowStep): void {
    this.results.set(stepId, result);
    this.steps.set(stepId, { ...step });

    if (result.evidence) {
      const ev = result.evidence;
      for (const [key, value] of Object.entries(ev)) {
        if (value !== undefined) {
          this.variables.set(`${stepId}.${key}`, value);
        }
      }
    }
  }

  getStepResult(stepId: string): ToolExecutionResult | undefined {
    return this.results.get(stepId);
  }

  getStep(stepId: string): WorkflowStep | undefined {
    return this.steps.get(stepId);
  }

  setVariable(key: string, value: unknown): void {
    this.variables.set(key, value);
  }

  getVariable(key: string): unknown {
    return this.variables.get(key);
  }

  /**
   * Resolves dynamic template variables and propagates outputs from prerequisite steps
   */
  resolveInputs(step: WorkflowStep): Record<string, unknown> {
    const resolvedInput: Record<string, unknown> = { ...step.input };

    // 1. Automatic dependency output propagation
    if (Array.isArray(step.dependencies)) {
      for (const depId of step.dependencies) {
        const depResult = this.results.get(depId);
        if (depResult?.evidence) {
          const ev = depResult.evidence;

          // Propagate filesystem path
          if (ev.resolvedPath) {
            if (!resolvedInput.resolvedPath) resolvedInput.resolvedPath = ev.resolvedPath;
            if (!resolvedInput.targetPath) resolvedInput.targetPath = ev.resolvedPath;
            if (!resolvedInput.filePath) resolvedInput.filePath = ev.resolvedPath;
          }

          // Propagate process PID
          if (ev.pid !== undefined && resolvedInput.pid === undefined) {
            resolvedInput.pid = ev.pid;
          }

          // Propagate process Name
          if (ev.processName && !resolvedInput.processName) {
            resolvedInput.processName = ev.processName;
          }

          // Propagate URL
          if (ev.url && !resolvedInput.url) {
            resolvedInput.url = ev.url;
          }

          // Propagate Launch Method
          if (ev.method && !resolvedInput.method) {
            resolvedInput.method = ev.method;
          }

          // Propagate Screenshot Data
          if (ev.dataUrl && !resolvedInput.dataUrl) {
            resolvedInput.dataUrl = ev.dataUrl;
          }
        }
      }
    }

    // 2. Template Expression Replacement (e.g. "$step_1.resolvedPath" or "{{step_1.pid}}")
    for (const [k, v] of Object.entries(resolvedInput)) {
      if (typeof v === 'string') {
        let replacedStr = v;
        for (const [varKey, varVal] of this.variables.entries()) {
          const pattern1 = `$${varKey}`;
          const pattern2 = `{{${varKey}}}`;
          if (replacedStr === pattern1 || replacedStr === pattern2) {
            resolvedInput[k] = varVal;
            replacedStr = '';
            break;
          } else if (typeof varVal === 'string' || typeof varVal === 'number') {
            replacedStr = replacedStr.split(pattern1).join(String(varVal));
            replacedStr = replacedStr.split(pattern2).join(String(varVal));
            resolvedInput[k] = replacedStr;
          }
        }
      }
    }

    return resolvedInput;
  }

  getAllResults(): Map<string, ToolExecutionResult> {
    return new Map(this.results);
  }

  getAllSteps(): Map<string, WorkflowStep> {
    return new Map(this.steps);
  }
}
