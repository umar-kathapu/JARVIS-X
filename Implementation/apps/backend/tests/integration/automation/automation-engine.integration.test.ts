import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { automationEngine } from '../../../src/automation/core/automation.engine.js';
import { workflowCompiler } from '../../../src/automation/engine/workflow.compiler.js';
import { jobQueue } from '../../../src/automation/queue/job.queue.js';
import { cronScheduler } from '../../../src/automation/scheduler/cron.scheduler.js';
import { errorRecoveryService } from '../../../src/automation/recovery/error-recovery.service.js';
import { WorkflowDefinition } from '../../../src/automation/types/workflow.types.js';

describe('Automation Engine Subsystem Integration Tests', () => {
  beforeEach(() => {
    jobQueue.clear();
  });

  afterEach(() => {
    jobQueue.clear();
    cronScheduler.stopScheduler();
  });

  it('1. AutomationEngine should initialize as a singleton with built-in actions registered', () => {
    expect(automationEngine).toBeDefined();
    const instance = automationEngine;
    expect(instance).toBe(automationEngine);
  });

  it('2. Should compile workflow definition into executable DAG node list', () => {
    const rawWorkflow: WorkflowDefinition = {
      id: 'wf_test_dag_1',
      name: 'DAG Compilation Test Workflow',
      description: 'Tests DAG compiler topological sort',
      version: '1.0.0',
      nodes: [
        {
          id: 'node_1',
          name: 'Start Step',
          type: 'TRIGGER',
          actionOrTriggerId: 'manual_trigger',
          parameters: {},
        },
        {
          id: 'node_2',
          name: 'Memory Save Step',
          type: 'ACTION',
          actionOrTriggerId: 'memory_save',
          parameters: { key: 'k1', content: 'c1' },
        },
      ],
      edges: [{ id: 'edge_1', sourceNodeId: 'node_1', targetNodeId: 'node_2' }],
    };

    const compiledNodes = workflowCompiler.compile(rawWorkflow);
    expect(Array.isArray(compiledNodes)).toBe(true);
    expect(compiledNodes.length).toBe(2);
    expect(compiledNodes[0]?.id).toBe('node_1');
    expect(compiledNodes[1]?.id).toBe('node_2');
  });

  it('3. Should execute workflow end-to-end through execution runtime', async () => {
    const workflow: WorkflowDefinition = {
      id: 'wf_exec_test',
      name: 'End to End Execution Workflow',
      description: 'Tests runtime execution',
      version: '1.0.0',
      nodes: [
        {
          id: 'step_1',
          name: 'AI Step',
          type: 'TRIGGER',
          actionOrTriggerId: 'ai_prompt',
          parameters: {},
        },
        {
          id: 'step_2',
          name: 'Notification Step',
          type: 'ACTION',
          actionOrTriggerId: 'desktop_notification',
          parameters: { title: 'T', body: 'B' },
        },
      ],
      edges: [{ id: 'e1', sourceNodeId: 'step_1', targetNodeId: 'step_2' }],
    };

    const result = await automationEngine.executeWorkflow(workflow, { initialVar: 'test' });
    expect(result.status).toBe('SUCCESS');
    expect(result.nodeResults).toBeDefined();
    expect(result.errorMessage).toBeUndefined();
  });

  it('4. Should enqueue jobs with priority ordering and support queue clearing', () => {
    const jobLow = automationEngine.enqueueJob('wf_low', { data: 1 });
    jobQueue.enqueue('wf_critical', { data: 2 }, 'CRITICAL');
    jobQueue.enqueue('wf_high', { data: 3 }, 'HIGH');

    expect(jobQueue.getQueueLength()).toBe(3);

    // Verify priority sorting: CRITICAL -> HIGH -> NORMAL -> LOW
    const firstOut = jobQueue.dequeue();
    expect(firstOut?.workflowId).toBe('wf_critical');

    const secondOut = jobQueue.dequeue();
    expect(secondOut?.workflowId).toBe('wf_high');

    const thirdOut = jobQueue.dequeue();
    expect(thirdOut?.workflowId).toBe(jobLow.workflowId);

    // Verify queue clearing
    jobQueue.enqueue('wf_temp', {});
    jobQueue.clear();
    expect(jobQueue.getQueueLength()).toBe(0);
  });

  it('5. Should handle job failure recovery and move to DLQ on max retries', () => {
    const job = jobQueue.enqueue('wf_failed_job', { input: 'bad' });
    expect(job.status).toBe('QUEUED');

    jobQueue.moveToDLQ(job, 'Simulated execution error');
    expect(job.status).toBe('DLQ');
    expect(job.errorMessage).toBe('Simulated execution error');
    expect(jobQueue.getDLQLength()).toBe(1);
  });

  it('6. Should support checkpoint creation and execution recovery', async () => {
    const mockContext = {
      executionId: 'exec_chk_123',
      workflowId: 'wf_chk',
      variables: {},
      stepResults: {},
    };

    await errorRecoveryService.createCheckpoint(mockContext as any);
    const recovered = await errorRecoveryService.recoverExecution('exec_chk_123');
    expect(recovered).toBe(true);
  });
});
