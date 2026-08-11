import React, { useState } from 'react';
import { PlanStep } from '../../../../main/agent/agent.types.js';

export interface ExecutionStepResultProps {
  step: PlanStep;
  isExpandedDefault?: boolean;
}

export const ExecutionStepResult: React.FC<ExecutionStepResultProps> = ({
  step,
  isExpandedDefault = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(isExpandedDefault || step.status === 'FAILED');

  // Determine Evidence Badge
  const getEvidenceBadge = () => {
    if (step.status === 'CANCELLED') {
      return {
        label: 'CANCELLED',
        className: 'bg-slate-800/80 text-slate-400 border-slate-700/60',
        icon: '⏸️',
      };
    }
    if (step.status === 'FAILED' || step.status === 'BLOCKED') {
      return {
        label: 'FAILED',
        className: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
        icon: '❌',
      };
    }
    if (step.verified || step.evidence?.verified) {
      return {
        label: 'VERIFIED',
        className: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
        icon: '🛡️',
      };
    }
    if (step.status === 'COMPLETED') {
      return {
        label: 'UNVERIFIED',
        className: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
        icon: '⚠️',
      };
    }
    return {
      label: 'PENDING',
      className: 'bg-slate-900 text-slate-500 border-slate-800',
      icon: '⏳',
    };
  };

  const evidenceBadge = getEvidenceBadge();

  return (
    <div
      className={`p-3.5 rounded-lg border transition-all space-y-2 ${
        step.status === 'COMPLETED'
          ? 'bg-slate-950/70 border-slate-800/90'
          : step.status === 'FAILED'
            ? 'bg-rose-950/20 border-rose-800/50'
            : step.status === 'BLOCKED'
              ? 'bg-amber-950/20 border-amber-800/50'
              : step.status === 'CANCELLED'
                ? 'bg-slate-900/30 border-slate-800/40 opacity-70'
                : 'bg-slate-950/50 border-slate-800/60'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <span
            className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${
              step.status === 'COMPLETED'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : step.status === 'RUNNING'
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse'
                  : step.status === 'FAILED' || step.status === 'BLOCKED'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-slate-800 text-slate-400'
            }`}
          >
            {step.status === 'COMPLETED'
              ? '✓'
              : step.status === 'FAILED'
                ? '❌'
                : step.status === 'CANCELLED'
                  ? '⏸️'
                  : step.stepNumber}
          </span>

          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-200 truncate">{step.description}</div>

            {/* Metadata Tags */}
            <div className="flex flex-wrap gap-2 mt-1.5 items-center">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-sky-400 border border-slate-700/80">
                Tool: {step.tool || step.toolName}
              </span>

              {step.result?.action && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800">
                  Action: {step.result.action}
                </span>
              )}

              {step.duration !== undefined && step.duration >= 0 && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {step.status === 'COMPLETED' ? `Completed in ${step.duration} ms` : `${step.duration} ms`}
                </span>
              )}

              {step.securityLevel && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  Policy: {step.securityLevel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Badges: Status + Evidence */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${evidenceBadge.className}`}
            >
              {evidenceBadge.icon} {evidenceBadge.label}
            </span>

            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                step.status === 'COMPLETED'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : step.status === 'RUNNING'
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : step.status === 'FAILED' || step.status === 'BLOCKED'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-slate-800 text-slate-400'
              }`}
            >
              {step.status}
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors underline"
          >
            {isExpanded ? 'Collapse Details ▲' : 'Expand Details ▼'}
          </button>
        </div>
      </div>

      {/* Output Summary & Structured Evidence Box */}
      {(isExpanded || step.status === 'FAILED' || step.status === 'BLOCKED') && (
        <div className="mt-2.5 p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-2">
          {/* Input Parameters */}
          {step.input && Object.keys(step.input).length > 0 && (
            <div className="text-slate-400">
              <span className="text-slate-500 font-bold">INPUT: </span>
              <span>{JSON.stringify(step.input)}</span>
            </div>
          )}

          {/* Primary Output */}
          {step.result?.output && (
            <div>
              <div className="text-slate-400 font-bold mb-0.5">
                {step.status === 'FAILED' ? 'ERROR OUTPUT:' : 'OUTPUT:'}
              </div>
              <div
                className={`whitespace-pre-wrap ${
                  step.status === 'FAILED' ? 'text-rose-400' : 'text-slate-200'
                }`}
              >
                {step.result.output}
              </div>
            </div>
          )}

          {/* Error Details */}
          {step.error && (
            <div className="p-2 rounded bg-rose-950/30 border border-rose-800/40 text-rose-300 space-y-0.5">
              <div className="font-bold">Error: {step.error}</div>
              {step.result?.evidence?.verificationDetails && (
                <div className="text-[10px] text-rose-400">
                  Details: {step.result.evidence.verificationDetails}
                </div>
              )}
            </div>
          )}

          {/* Real Verified Evidence Fields */}
          {step.evidence && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
              <div className="text-emerald-400 font-bold text-[10px] tracking-wider uppercase">
                Verified Evidence
              </div>

              {step.evidence.pid !== undefined && (
                <div className="text-sky-300 font-bold">
                  <span className="text-slate-500 font-normal">PID: </span>
                  {step.evidence.pid}
                </div>
              )}

              {step.evidence.resolvedPath && (
                <div className="text-slate-300 break-all">
                  <span className="text-slate-500 font-normal">Path: </span>
                  {step.evidence.resolvedPath}
                </div>
              )}

              {step.evidence.method && (
                <div className="text-indigo-300">
                  <span className="text-slate-500 font-normal">Method: </span>
                  {step.evidence.method}
                </div>
              )}

              {step.evidence.fileSizeBytes !== undefined && (
                <div className="text-slate-300">
                  <span className="text-slate-500 font-normal">Size: </span>
                  {step.evidence.fileSizeBytes} bytes
                </div>
              )}

              {step.evidence.dimensions && (
                <div className="text-slate-300">
                  <span className="text-slate-500 font-normal">Resolution: </span>
                  {step.evidence.dimensions.width}x{step.evidence.dimensions.height}
                </div>
              )}

              {step.evidence.fileCount !== undefined && (
                <div className="text-slate-300">
                  <span className="text-slate-500 font-normal">Files Found: </span>
                  {step.evidence.fileCount}
                </div>
              )}

              {step.evidence.verificationDetails && (
                <div className="text-slate-400 text-[10px]">
                  <span className="text-slate-500 font-normal">Verification: </span>
                  {step.evidence.verificationDetails}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
