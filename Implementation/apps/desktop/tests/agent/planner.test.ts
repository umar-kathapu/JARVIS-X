import { describe, it, expect } from 'vitest';
import { nluService } from '../../src/main/agent/nlu.service.js';
import { dynamicTaskPlanner } from '../../src/main/agent/planner.service.js';

describe('Dynamic Task Planner', () => {
  it('generates distinct, variable-step plans for different goals', () => {
    const goals = [
      'Open Chrome',
      'Open Chrome and navigate to github.com',
      'Run system diagnostics',
      'Create a folder called Projects on my Desktop',
      'Check whether Node.js is installed',
      'Run git status in the JARVIS-X project',
    ];

    const plans = goals.map((g) => {
      const parsed = nluService.parseGoal(g);
      return dynamicTaskPlanner.createPlan(parsed);
    });

    // Verify all plans are distinct in tool names, descriptions, or step counts
    const toolSequences = plans.map((p) => p.steps.map((s) => s.toolName).join(' -> '));
    const uniqueToolSequences = new Set(toolSequences);
    expect(uniqueToolSequences.size).toBe(goals.length);
  });

  it('assigns correct tool arguments for application launch', () => {
    const parsed = nluService.parseGoal('Open WhatsApp');
    const plan = dynamicTaskPlanner.createPlan(parsed);

    expect(plan.steps.length).toBe(1);
    expect(plan.steps[0]?.toolName).toBe('application.launch');
    expect(plan.steps[0]?.toolArgs.appName).toBe('WhatsApp');
  });

  it('generates multi-step plan for system diagnostics', () => {
    const parsed = nluService.parseGoal('Run system diagnostics');
    const plan = dynamicTaskPlanner.createPlan(parsed);

    expect(plan.steps.length).toBe(2);
    expect(plan.steps[0]?.toolName).toBe('system.get_metrics');
    expect(plan.steps[1]?.toolName).toBe('system.run_diagnostics');
  });
});
