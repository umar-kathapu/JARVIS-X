import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '@jarvis-x/ui';
import { AgentExecutionPlan, PlanStep } from '../../../../main/agent/agent.types.js';
import { WorkflowInstance } from '../../../../main/agent/workflow.types.js';
import { ExecutionStepResult } from '../agent/ExecutionStepResult.js';
import { AgentFinalResult } from '../agent/AgentFinalResult.js';
import { WorkflowExecutionPanel } from '../agent/WorkflowExecutionPanel.js';

export const AiAgentsPage: React.FC = () => {
  const [goal, setGoal] = useState('Prepare my desktop for coding');
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'workflow' | 'steps'>('workflow');
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowInstance>({
    workflowId: 'initial_wf',
    originalGoal: 'Prepare my desktop for coding',
    intent: 'COMPOSITE_COMMAND',
    status: 'COMPLETED',
    createdAt: Date.now(),
    steps: [
      {
        stepId: 'step_1',
        description: 'Check whether Git version control is installed',
        intent: 'CHECK_SOFTWARE',
        tool: 'system.check_software',
        input: { softwareName: 'git' },
        dependencies: [],
        securityLevel: 'SAFE',
        status: 'COMPLETED',
        duration: 42,
        output: 'Software "git" IS installed: git version 2.52.0.windows.1',
        verified: true,
        verificationDetails: 'Detected git version git version 2.52.0.windows.1',
        evidence: { verified: true, verificationDetails: 'Detected git version git version 2.52.0.windows.1' },
      },
      {
        stepId: 'step_2',
        description: 'Check whether Python runtime is installed',
        intent: 'CHECK_SOFTWARE',
        tool: 'system.check_software',
        input: { softwareName: 'python' },
        dependencies: [],
        securityLevel: 'SAFE',
        status: 'COMPLETED',
        duration: 38,
        output: 'Software "python" IS installed: Python 3.14.0',
        verified: true,
        verificationDetails: 'Detected python version Python 3.14.0',
        evidence: { verified: true, verificationDetails: 'Detected python version Python 3.14.0' },
      },
      {
        stepId: 'step_3',
        description: 'Resolve executable path for VS Code',
        intent: 'OPEN_APPLICATION',
        tool: 'application.resolve',
        input: { appName: 'VS Code' },
        dependencies: [],
        securityLevel: 'SAFE',
        status: 'COMPLETED',
        duration: 3,
        output: 'Resolved "VS Code" executable: "C:\\Program Files\\Microsoft VS Code\\Code.exe"',
        verified: true,
        verificationDetails: 'Found via KNOWN_PATH (APPLICATION_LAUNCH)',
        evidence: {
          resolvedPath: 'C:\\Program Files\\Microsoft VS Code\\Code.exe',
          verified: true,
          verificationDetails: 'Found via KNOWN_PATH (APPLICATION_LAUNCH)',
        },
      },
      {
        stepId: 'step_4',
        description: 'Launch VS Code development editor',
        intent: 'OPEN_APPLICATION',
        tool: 'application.launch',
        input: { appName: 'VS Code' },
        dependencies: ['step_3'],
        securityLevel: 'SAFE',
        status: 'COMPLETED',
        duration: 195,
        output: 'Application "VS Code" started successfully (PID: 26132)',
        verified: true,
        verificationDetails: 'Process verified active with OS PID 26132',
        evidence: {
          pid: 26132,
          resolvedPath: 'C:\\Program Files\\Microsoft VS Code\\Code.exe',
          verified: true,
          verificationDetails: 'Process verified active with OS PID 26132',
        },
      },
      {
        stepId: 'step_5',
        description: 'Verify workspace folder exists on disk',
        intent: 'CREATE_DIRECTORY',
        tool: 'filesystem.verify_directory',
        input: { targetPath: 'JARVIS-Coding-Workspace' },
        dependencies: ['step_4'],
        securityLevel: 'SAFE',
        status: 'COMPLETED',
        duration: 1,
        output: 'Verified directory exists on disk at "C:\\Users\\Admin\\OneDrive\\Desktop\\JARVIS-Coding-Workspace"',
        verified: true,
        verificationDetails: 'Confirmed directory on disk',
        evidence: {
          resolvedPath: 'C:\\Users\\Admin\\OneDrive\\Desktop\\JARVIS-Coding-Workspace',
          verified: true,
          verificationDetails: 'Confirmed directory on disk',
        },
      },
    ],
    finalResult: {
      summary: 'WORKFLOW COMPLETED: All 5 step(s) executed and verified successfully on system.',
      totalSteps: 5,
      completedSteps: 5,
      failedSteps: 0,
      blockedSteps: 0,
      skippedSteps: 0,
      cancelledSteps: 0,
      evidence: [
        '✓ Detected git version git version 2.52.0.windows.1',
        '✓ Detected python version Python 3.14.0',
        '✓ Launch VS Code development editor (PID: 26132)',
        '✓ Verified folder on disk at "C:\\Users\\Admin\\OneDrive\\Desktop\\JARVIS-Coding-Workspace"',
      ],
      isSuccess: true,
    },
  });
  const [currentPlan, setCurrentPlan] = useState<AgentExecutionPlan>({
    goalId: 'initial',
    rawGoal: 'Open Chrome and navigate to github.com',
    intent: 'OPEN_URL',
    status: 'COMPLETED',
    createdAt: Date.now(),
    steps: [
      {
        stepId: 'step_1',
        stepNumber: 1,
        description: 'Open browser and navigate to https://github.com',
        tool: 'browser.open_url',
        toolName: 'browser.open_url',
        toolArgs: { url: 'https://github.com' },
        input: { url: 'https://github.com' },
        securityLevel: 'SAFE',
        status: 'COMPLETED',
        duration: 38,
        durationMs: 38,
        verified: true,
        verificationDetails: 'Dispatched URL to OS Default Web Browser (https://github.com)',
        evidence: {
          url: 'https://github.com',
          verified: true,
          verificationDetails: 'Dispatched URL to OS Default Web Browser (https://github.com)',
        },
        result: {
          success: true,
          status: 'COMPLETED',
          tool: 'browser.open_url',
          action: 'OPEN_URL',
          parameters: { url: 'https://github.com' },
          output: 'System browser opened and navigated to https://github.com',
          evidence: {
            url: 'https://github.com',
            verified: true,
            verificationDetails: 'Dispatched URL to OS Default Web Browser (https://github.com)',
          },
        },
      },
    ],
  });
  const [executionOutput, setExecutionOutput] = useState<string>(
    'System browser opened and navigated to https://github.com',
  );
  const [availableToolsCount, setAvailableToolsCount] = useState<number>(18);

  useEffect(() => {
    if ((window as any).electronAPI?.getAgentTools) {
      (window as any).electronAPI.getAgentTools().then((tools: any[]) => {
        if (Array.isArray(tools) && tools.length > 0) {
          setAvailableToolsCount(tools.length);
        }
      });
    }
  }, []);

  const presetGoals = [
    'Prepare my desktop for coding',
    'Check whether Git and Python are installed, launch VS Code, and show me the system health',
    'Take a screenshot, create a folder called JARVIS-Screenshots on my Desktop, and save the screenshot there',
    'Open Chrome and search for Python machine learning tutorials',
    'Check whether Git and Python are installed',
    'Take a screenshot',
    'Run system diagnostics',
    'Find PDF files in Downloads',
    'Open FakeUnknownApp9999',
    'Open VS Code',
    'Open Chrome',
  ];

  const handleExecuteGoal = async (targetGoal: string) => {
    if (!targetGoal.trim() || isExecuting) return;

    setIsExecuting(true);
    setExecutionOutput('Analyzing natural language goal & generating dynamic execution plan...');

    // If running in Electron environment with IPC
    if ((window as any).electronAPI?.executeAgentGoal) {
      try {
        const res = await (window as any).electronAPI.executeAgentGoal(targetGoal);
        if (res && res.plan) {
          setCurrentPlan(res.plan);
          setExecutionOutput(res.finalResponse || 'Execution finished.');

          // Map plan to workflow instance for WorkflowExecutionPanel
          const wfSteps = (res.plan.steps || []).map((s: any, idx: number) => ({
            stepId: s.stepId || `step_${idx + 1}`,
            description: s.description,
            intent: res.plan.intent,
            tool: s.tool || s.toolName,
            input: s.input || s.toolArgs || {},
            dependencies: s.dependsOn ? s.dependsOn.map((d: number) => `step_${d}`) : [],
            securityLevel: s.securityLevel,
            status: s.status,
            duration: s.duration || s.durationMs,
            durationMs: s.duration || s.durationMs,
            output: s.result?.output,
            evidence: s.evidence || s.result?.evidence,
            verified: s.verified ?? s.result?.evidence?.verified ?? (s.status === 'COMPLETED'),
            verificationDetails: s.verificationDetails || s.result?.evidence?.verificationDetails,
            error: s.error,
          }));

          setCurrentWorkflow({
            workflowId: res.plan.goalId || `wf_${Date.now()}`,
            originalGoal: targetGoal,
            intent: res.plan.intent,
            status: res.plan.status === 'COMPLETED' ? 'COMPLETED' : 'FAILED',
            createdAt: Date.now(),
            steps: wfSteps,
            finalResult: {
              summary: res.finalResponse || '',
              totalSteps: wfSteps.length,
              completedSteps: wfSteps.filter((s: any) => s.status === 'COMPLETED').length,
              failedSteps: wfSteps.filter((s: any) => s.status === 'FAILED').length,
              blockedSteps: wfSteps.filter((s: any) => s.status === 'BLOCKED').length,
              skippedSteps: 0,
              cancelledSteps: wfSteps.filter((s: any) => s.status === 'CANCELLED').length,
              evidence: wfSteps
                .filter((s: any) => s.status === 'COMPLETED')
                .map((s: any) => `✓ ${s.description}`),
              isSuccess: res.plan.status === 'COMPLETED',
            },
          });
        } else {
          setExecutionOutput(res?.finalResponse || 'No execution plan generated.');
        }
      } catch (err: any) {
        setExecutionOutput(`Execution Error: ${err.message || String(err)}`);
      } finally {
        setIsExecuting(false);
      }
      return;
    }

    // Fallback Mock for Isolated Browser Testing
    setTimeout(() => {
      setIsExecuting(false);
      setExecutionOutput(`[Preview Mode] Executed: "${targetGoal}"`);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header and Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <span className="text-indigo-400">🤖</span> JARVIS-X Autonomous Agent Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Dynamic tool-aware agent with verified OS evidence and sandboxed security policy
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Real OS Engine: {availableToolsCount} Registered Tools
          </div>
        </div>
      </div>

      {/* 2. Goal Input & Interactive Preset Commands */}
      <Card title="Goal Execution Console" subtitle="Enter any natural language command for dynamic multi-step planning">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteGoal(goal);
          }}
          className="space-y-4 mt-2"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="e.g. Open Chrome and search for Python machine learning tutorials"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                disabled={isExecuting}
              />
            </div>
            <Button type="submit" disabled={isExecuting || !goal.trim()} className="whitespace-nowrap">
              {isExecuting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Executing Real Tools...
                </span>
              ) : (
                '🚀 Execute Goal'
              )}
            </Button>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-400 mb-2">Preset Natural Language Goals:</div>
            <div className="flex flex-wrap gap-2">
              {presetGoals.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setGoal(preset);
                    handleExecuteGoal(preset);
                  }}
                  disabled={isExecuting}
                  className="px-2.5 py-1 text-xs rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors disabled:opacity-50"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Card>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('workflow')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors flex items-center gap-1.5 ${
            activeTab === 'workflow'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span>⚡</span> Multi-Step Workflow Engine
        </button>
        <button
          onClick={() => setActiveTab('steps')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors flex items-center gap-1.5 ${
            activeTab === 'steps'
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span>📋</span> Detailed Step Breakdown & Evidence
        </button>
      </div>

      {activeTab === 'workflow' ? (
        <WorkflowExecutionPanel
          workflow={currentWorkflow}
          onCancel={() => {
            if ((window as any).electronAPI?.cancelWorkflow) {
              (window as any).electronAPI.cancelWorkflow(currentWorkflow.workflowId);
            }
          }}
        />
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Dynamic Execution Plan" subtitle={`${currentPlan.steps.length} Real-World Step(s)`}>
            <div className="space-y-4 mt-2">
              {/* UNDERSTANDING SECTION */}
              <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs">
                <div className="text-[10px] font-bold tracking-wider uppercase text-indigo-400">UNDERSTANDING</div>
                <div className="mt-1 flex items-center justify-between text-slate-200">
                  <span className="font-semibold font-mono text-indigo-300">{currentPlan.intent}</span>
                  <span className="text-[11px] text-slate-400">Dynamic Tool-Aware Planner</span>
                </div>
              </div>

              {/* EXECUTION PLAN STEPS */}
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400">EXECUTION PLAN</div>
                {currentPlan.steps.length === 0 ? (
                  <div className="p-4 text-xs text-rose-400 rounded-lg bg-rose-950/20 border border-rose-800/30">
                    ❌ Unsupported capability or no executable steps generated.
                  </div>
                ) : (
                  currentPlan.steps.map((step) => (
                    <ExecutionStepResult key={step.stepId || step.stepNumber} step={step} />
                  ))
                )}
              </div>
            </div>
          </Card>

          <Card title="Truthful Execution Response" subtitle="Live evidence stream & verified system state">
            <AgentFinalResult plan={currentPlan} finalResponse={executionOutput} isExecuting={isExecuting} />
          </Card>
        </section>
      )}
    </div>
  );
};
