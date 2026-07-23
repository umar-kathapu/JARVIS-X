import { describe, it, expect } from 'vitest';
import { workflowCompiler } from '../../src/automation/engine/workflow.compiler.js';
import { executionRuntime } from '../../src/automation/engine/execution.runtime.js';
import { jobQueue } from '../../src/automation/queue/job.queue.js';
import { SystemHealthDiagnosticWorkflow } from '../../src/automation/sample/sample-workflows.js';
import { automationEngine } from '../../src/automation/core/automation.engine.js';

describe('Automation & Workflow Engine Unit Tests', () => {
  it('WorkflowCompiler should compile DAG nodes in topological order', () => {
    const compiledNodes = workflowCompiler.compile(SystemHealthDiagnosticWorkflow);
    expect(compiledNodes.length).toBe(4);
    expect(compiledNodes[0]?.type).toBe('TRIGGER');
  });

  it('JobQueue should enqueue and prioritize jobs by priority level', () => {
    jobQueue.enqueue('wf_1', { data: 1 }, 'LOW');
    const jobHigh = jobQueue.enqueue('wf_2', { data: 2 }, 'HIGH');
    jobQueue.enqueue('wf_3', { data: 3 }, 'NORMAL');

    const dequeued = jobQueue.dequeue();
    expect(dequeued?.id).toBe(jobHigh.id);
  });

  it('ExecutionRuntime should execute sample workflow nodes successfully', async () => {
    const result = await executionRuntime.execute(SystemHealthDiagnosticWorkflow);
    expect(result.status).toBe('SUCCESS');
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.nodeResults).toHaveProperty('node_ai_diag');
  });

  it('AutomationEngine facade should execute workflows cleanly', async () => {
    const result = await automationEngine.executeWorkflow(SystemHealthDiagnosticWorkflow);
    expect(result.executionId).toBeTruthy();
    expect(result.status).toBe('SUCCESS');
  });
});
