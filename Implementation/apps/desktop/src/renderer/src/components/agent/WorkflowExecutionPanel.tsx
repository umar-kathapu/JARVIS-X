import React, { useState } from 'react';
import { WorkflowInstance, WorkflowStep } from '../../../../main/agent/workflow.types.js';

export interface WorkflowExecutionPanelProps {
  workflow: WorkflowInstance;
  onCancel?: () => void;
}

export const WorkflowExecutionPanel: React.FC<WorkflowExecutionPanelProps> = ({
  workflow,
  onCancel,
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const totalSteps = workflow.steps.length;
  const completedSteps = workflow.steps.filter((s) => s.status === 'COMPLETED').length;
  const failedSteps = workflow.steps.filter((s) => s.status === 'FAILED').length;
  const blockedSteps = workflow.steps.filter((s) => s.status === 'BLOCKED').length;
  const isRunning = workflow.status === 'RUNNING';
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'COMPLETED', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'RUNNING':
        return { label: 'RUNNING', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 animate-pulse' };
      case 'PARTIAL':
        return { label: 'PARTIAL', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
      case 'FAILED':
        return { label: 'FAILED', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      case 'BLOCKED':
        return { label: 'BLOCKED', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'CANCELLED':
        return { label: 'CANCELLED', bg: 'bg-slate-800 text-slate-400 border-slate-700' };
      default:
        return { label: status, bg: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
  };

  const statusBadge = getStatusBadge(workflow.status);

  return (
    <div className="space-y-5 font-mono text-xs">
      {/* 1. Autonomous Workflow Header */}
      <div className="p-4 rounded-lg bg-slate-950/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 text-sm">⚡</span>
            <span className="font-bold text-slate-100 tracking-wider uppercase">AUTONOMOUS WORKFLOW</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className={`px-2.5 py-0.5 rounded font-bold border text-[11px] ${statusBadge.bg}`}>
              {statusBadge.label}
            </span>

            {isRunning && onCancel && (
              <button
                onClick={onCancel}
                className="px-2 py-0.5 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[10px] font-bold transition-colors"
              >
                ⏹ Cancel Workflow
              </button>
            )}
          </div>
        </div>

        <div className="text-slate-300">
          <span className="text-slate-500 font-bold">Goal: </span>
          <span className="font-semibold text-slate-100">{workflow.originalGoal}</span>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Progress: {completedSteps} / {totalSteps} steps completed</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                workflow.status === 'COMPLETED'
                  ? 'bg-emerald-500'
                  : workflow.status === 'FAILED'
                    ? 'bg-rose-500'
                    : 'bg-indigo-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Execution Graph & Dependency Chain */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[11px]">
          <span>EXECUTION GRAPH & DEPENDENCIES</span>
          <span>{totalSteps} Step(s)</span>
        </div>

        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {workflow.steps.map((step, idx) => {
            const isExpanded = expandedSteps[step.stepId] || step.status === 'FAILED' || step.status === 'BLOCKED';

            return (
              <div
                key={step.stepId}
                className={`p-3 rounded-lg border transition-all space-y-2 ${
                  step.status === 'COMPLETED'
                    ? 'bg-slate-950/80 border-slate-800'
                    : step.status === 'FAILED'
                      ? 'bg-rose-950/30 border-rose-800/60'
                      : step.status === 'BLOCKED'
                        ? 'bg-amber-950/30 border-amber-800/60'
                        : step.status === 'CANCELLED'
                          ? 'bg-slate-900/30 border-slate-800/40 opacity-60'
                          : 'bg-slate-950/40 border-slate-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                        step.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : step.status === 'RUNNING'
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse'
                            : step.status === 'FAILED'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : step.status === 'BLOCKED'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {step.status === 'COMPLETED'
                        ? '✓'
                        : step.status === 'FAILED'
                          ? '❌'
                          : step.status === 'BLOCKED'
                            ? '⏸️'
                            : step.status === 'CANCELLED'
                              ? '⏹️'
                              : idx + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="font-medium text-slate-200 truncate">{step.description}</div>

                      <div className="flex flex-wrap gap-2 mt-1 items-center">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-sky-400 border border-slate-800">
                          Tool: {step.tool}
                        </span>

                        {step.dependencies && step.dependencies.length > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800">
                            dependsOn: {step.dependencies.join(', ')}
                          </span>
                        )}

                        {step.duration !== undefined && step.duration >= 0 && (
                          <span className="text-[10px] text-slate-500">
                            {step.duration} ms
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        step.status === 'COMPLETED'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                          : step.status === 'FAILED'
                            ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                            : step.status === 'BLOCKED'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {step.status === 'COMPLETED' && step.verified
                        ? '🛡️ VERIFIED'
                        : step.status}
                    </span>

                    <button
                      onClick={() => toggleStep(step.stepId)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                    >
                      {isExpanded ? 'Hide ▲' : 'Details ▼'}
                    </button>
                  </div>
                </div>

                {/* Blocked Reason Notice */}
                {step.blockedReason && (
                  <div className="p-2 rounded bg-amber-950/20 border border-amber-800/40 text-amber-300 text-[11px]">
                    <span className="font-bold">⚠️ Blocked: </span>
                    <span>{step.blockedReason}</span>
                  </div>
                )}

                {/* Collapsible Details */}
                {isExpanded && (
                  <div className="p-2.5 rounded bg-black/60 border border-slate-800/90 space-y-1.5 text-[11px] text-slate-300">
                    {step.input && Object.keys(step.input).length > 0 && (
                      <div>
                        <span className="text-slate-500 font-bold">Input: </span>
                        <span>{JSON.stringify(step.input)}</span>
                      </div>
                    )}

                    {step.output && (
                      <div>
                        <span className="text-slate-500 font-bold">Output: </span>
                        <span className={step.status === 'FAILED' ? 'text-rose-400' : 'text-slate-200'}>
                          {step.output}
                        </span>
                      </div>
                    )}

                    {step.evidence && (
                      <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400 space-y-0.5">
                        {step.evidence.pid !== undefined && (
                          <div className="text-sky-300">PID: {step.evidence.pid}</div>
                        )}
                        {step.evidence.resolvedPath && (
                          <div>Path: {step.evidence.resolvedPath}</div>
                        )}
                        {step.evidence.verificationDetails && (
                          <div>Verification: {step.evidence.verificationDetails}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Final Summary & Evidence Card */}
      {workflow.finalResult && (
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="text-xs font-bold tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
              <span>{workflow.finalResult.isSuccess ? '✓' : '⚠️'}</span>
              <span>WORKFLOW FINAL RESULT</span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="text-emerald-400 font-bold">✓ {completedSteps} Completed</span>
              {failedSteps > 0 && <span className="text-rose-400 font-bold">❌ {failedSteps} Failed</span>}
              {blockedSteps > 0 && <span className="text-amber-400 font-bold">⏸️ {blockedSteps} Blocked</span>}
            </div>
          </div>

          <div className="text-slate-200 font-semibold">{workflow.finalResult.summary}</div>

          {workflow.finalResult.evidence && workflow.finalResult.evidence.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400">Verified Evidence:</div>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {workflow.finalResult.evidence.map((ev, i) => (
                  <div key={i} className="text-slate-300 text-[11px] leading-snug">
                    {ev}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
