import { describe, it, expect } from 'vitest';
import { nluService } from '../../src/main/agent/nlu.service.js';
import { dynamicTaskPlanner } from '../../src/main/agent/planner.service.js';
import { toolRegistry } from '../../src/main/agent/tool.registry.js';
import { agentExecutor } from '../../src/main/agent/agent.executor.js';

describe('R4.1 Dynamic Agent Planner Comprehensive Suite', () => {
  agentExecutor.initializeDefaultTools();

  it('A. Open Chrome → Generates command-aware dynamic plan with real registered tools', () => {
    const parsed = nluService.parseGoal('Open Chrome');
    const plan = dynamicTaskPlanner.createPlan(parsed);

    expect(plan.intent).toBe('OPEN_APPLICATION');
    expect(plan.steps.length).toBe(3);
    expect(plan.steps[0]?.toolName).toBe('application.resolve');
    expect(plan.steps[1]?.toolName).toBe('application.launch');
    expect(plan.steps[1]?.dependsOn).toEqual([1]);
    expect(plan.steps[2]?.toolName).toBe('application.verify');
    expect(plan.steps[2]?.dependsOn).toEqual([2]);

    // Verify all tools exist in Tool Registry
    plan.steps.forEach((step) => {
      expect(toolRegistry.getTool(step.toolName)).toBeDefined();
    });
  });

  it('B. Create Desktop folder → Generates multi-step filesystem plan', () => {
    const parsed = nluService.parseGoal('Create a folder called Projects on the Desktop');
    const plan = dynamicTaskPlanner.createPlan(parsed);

    expect(plan.intent).toBe('CREATE_DIRECTORY');
    expect(plan.steps.length).toBe(4);
    expect(plan.steps[0]?.toolName).toBe('filesystem.resolve_path');
    expect(plan.steps[1]?.toolName).toBe('filesystem.check_exists');
    expect(plan.steps[2]?.toolName).toBe('filesystem.create_directory');
    expect(plan.steps[3]?.toolName).toBe('filesystem.verify_directory');

    plan.steps.forEach((step) => {
      expect(toolRegistry.getTool(step.toolName)).toBeDefined();
    });
  });

  it('C. Take screenshot → Generates screenshot capture and verification plan', () => {
    const parsed = nluService.parseGoal('Take a screenshot');
    const plan = dynamicTaskPlanner.createPlan(parsed);

    expect(plan.intent).toBe('SCREEN_CAPTURE');
    expect(plan.steps.length).toBe(2);
    expect(plan.steps[0]?.toolName).toBe('screen.capture');
    expect(plan.steps[1]?.toolName).toBe('screen.verify');
    expect(plan.steps[1]?.dependsOn).toEqual([1]);

    plan.steps.forEach((step) => {
      expect(toolRegistry.getTool(step.toolName)).toBeDefined();
    });
  });

  it('D. Run diagnostics → Generates metrics collection and report compilation plan', () => {
    const parsed = nluService.parseGoal('Run system diagnostics');
    const plan = dynamicTaskPlanner.createPlan(parsed);

    expect(plan.intent).toBe('SYSTEM_DIAGNOSTICS');
    expect(plan.steps.length).toBe(2);
    expect(plan.steps[0]?.toolName).toBe('system.get_metrics');
    expect(plan.steps[1]?.toolName).toBe('system.run_diagnostics');
    expect(plan.steps[1]?.dependsOn).toEqual([1]);

    plan.steps.forEach((step) => {
      expect(toolRegistry.getTool(step.toolName)).toBeDefined();
    });
  });

  it('E. Find PDF files → Generates path resolution and find files plan', () => {
    const parsed = nluService.parseGoal('Find PDF files in Downloads');
    const plan = dynamicTaskPlanner.createPlan(parsed);

    expect(plan.intent).toBe('SEARCH_FILES');
    expect(plan.steps.length).toBe(2);
    expect(plan.steps[0]?.toolName).toBe('filesystem.resolve_path');
    expect(plan.steps[1]?.toolName).toBe('filesystem.find_files');
    expect(plan.steps[1]?.dependsOn).toEqual([1]);

    plan.steps.forEach((step) => {
      expect(toolRegistry.getTool(step.toolName)).toBeDefined();
    });
  });

  it('F. Multi-step application command → Decomposes composite goal into sequential dependency chain', () => {
    const parsed = nluService.parseGoal('Open Chrome and search for Python machine learning tutorials');
    const plan = dynamicTaskPlanner.createPlan(parsed);

    expect(plan.intent).toBe('COMPOSITE_COMMAND');
    expect(plan.steps.length).toBe(4); // 3 for Chrome + 1 for search_web
    expect(plan.steps[0]?.toolName).toBe('application.resolve');
    expect(plan.steps[1]?.toolName).toBe('application.launch');
    expect(plan.steps[2]?.toolName).toBe('application.verify');
    expect(plan.steps[3]?.toolName).toBe('browser.search_web');
    expect(plan.steps[3]?.toolArgs.query).toBe('Python machine learning tutorials');

    plan.steps.forEach((step) => {
      expect(toolRegistry.getTool(step.toolName)).toBeDefined();
    });
  });

  it('G. Unsupported command → Explicitly rejects without inventing fake tools', async () => {
    const { plan, finalResponse } = await agentExecutor.executeGoal('Fly me to the moon');

    expect(plan.status).toBe('FAILED');
    expect(plan.intent).toBe('UNSUPPORTED_CAPABILITY');
    expect(plan.steps.length).toBe(0);
    expect(finalResponse.toLowerCase()).toContain('unsupported');
  });

  it('H. ApplicationNotFound failure → Fails truthfully on unknown app without fake SUCCESS', async () => {
    const { plan, finalResponse } = await agentExecutor.executeGoal('Open FakeUnknownApp9999');

    expect(plan.status).toBe('FAILED');
    expect(plan.steps[0]?.status).toBe('FAILED');
    expect(plan.steps[0]?.error).toBe('ApplicationNotFound');
    expect(plan.steps[1]?.status).toBe('CANCELLED');
    expect(plan.steps[2]?.status).toBe('CANCELLED');
    expect(finalResponse.toLowerCase()).toContain('not installed or could not be found');
  });

  it('I. Dependent-step failure → Prevents step 2 execution when step 1 fails', async () => {
    const { plan } = await agentExecutor.executeGoal('Open NonExistentApp12345');

    expect(plan.steps[0]?.status).toBe('FAILED');
    expect(plan.steps[1]?.status).toBe('CANCELLED');
    expect(plan.steps[2]?.status).toBe('CANCELLED');
  });

  it('J. No fake SUCCESS → Task is marked FAILED when any real step fails', async () => {
    const { plan } = await agentExecutor.executeGoal('Open InvalidProgramXYZ');
    expect(plan.status).toBe('FAILED');
  });

  it('K. Step result propagation → Propagates resolved properties from Step 1 to Step 2', async () => {
    const { plan } = await agentExecutor.executeGoal('Open Instagram');

    expect(plan.status).toBe('COMPLETED');
    expect(plan.steps[0]?.status).toBe('COMPLETED');
    expect(plan.steps[1]?.status).toBe('COMPLETED');
    // Step 2 toolArgs should contain propagated URL or method from Step 1
    expect(plan.steps[1]?.toolArgs.url || plan.steps[1]?.toolArgs.resolvedPath || plan.steps[1]?.toolArgs.appName).toBeDefined();
  });

  it('L. Every plan step maps strictly to a registered tool in Tool Registry', () => {
    const testGoals = [
      'Open Chrome',
      'Open VS Code',
      'Open Instagram',
      'Create a folder called JARVIS-Test on my Desktop',
      'Take a screenshot',
      'Run system diagnostics',
      'Check whether Git is installed',
      'Find PDF files in Downloads',
      'Read file C:\\Windows\\System32\\drivers\\etc\\hosts',
      'Open Chrome and search for machine learning',
    ];

    for (const goal of testGoals) {
      const parsed = nluService.parseGoal(goal);
      const plan = dynamicTaskPlanner.createPlan(parsed);
      for (const step of plan.steps) {
        const tool = toolRegistry.getTool(step.toolName);
        expect(tool, `Tool ${step.toolName} in plan for "${goal}" must be registered`).toBeDefined();
      }
    }
  });
});
