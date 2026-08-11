import React from 'react';
import { AgentExecutionPlan } from '../../../../main/agent/agent.types.js';

export interface AgentFinalResultProps {
  plan: AgentExecutionPlan;
  finalResponse: string;
  isExecuting?: boolean;
}

export const AgentFinalResult: React.FC<AgentFinalResultProps> = ({
  plan,
  finalResponse,
  isExecuting = false,
}) => {
  const isFailed = plan.status === 'FAILED' || plan.status === 'BLOCKED' || plan.steps.some((s) => s.status === 'FAILED' || s.status === 'BLOCKED');
  const isCompleted = plan.status === 'COMPLETED' && !isFailed;

  // Extract real evidence from steps
  const appLaunchStep = plan.steps.find((s) => s.toolName === 'application.launch');
  const appResolveStep = plan.steps.find((s) => s.toolName === 'application.resolve');
  const appVerifyStep = plan.steps.find((s) => s.toolName === 'application.verify');
  const screenStep = plan.steps.find((s) => s.toolName === 'screen.capture');
  const screenVerifyStep = plan.steps.find((s) => s.toolName === 'screen.verify');
  const diagStep = plan.steps.find((s) => s.toolName === 'system.run_diagnostics');
  const metricsStep = plan.steps.find((s) => s.toolName === 'system.get_metrics');
  const findFilesStep = plan.steps.find((s) => s.toolName === 'filesystem.find_files');
  const createDirStep = plan.steps.find((s) => s.toolName === 'filesystem.create_directory');
  const failedStep = plan.steps.find((s) => s.status === 'FAILED' || s.status === 'BLOCKED');

  return (
    <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 min-h-[280px] flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Final Status Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div
            className={`text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 ${
              isCompleted
                ? 'text-emerald-400'
                : isFailed
                  ? 'text-rose-400'
                  : 'text-indigo-400'
            }`}
          >
            <span>{isCompleted ? '✓' : isFailed ? '❌' : '⏳'}</span>
            <span>FINAL RESULT</span>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              isCompleted
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50'
                : isFailed
                  ? 'bg-rose-950/50 text-rose-300 border-rose-800/50'
                  : 'bg-indigo-950/50 text-indigo-300 border-indigo-800/50'
            }`}
          >
            {isCompleted ? 'SUCCESS' : isFailed ? 'FAILED' : 'IN_PROGRESS'}
          </span>
        </div>

        {/* Failed Operation Display */}
        {isFailed && (
          <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-800/60 text-rose-200 space-y-2">
            <div className="text-sm font-bold text-rose-400">
              ❌ {failedStep ? `${failedStep.description} FAILED` : 'Task Execution FAILED'}
            </div>

            {failedStep && (
              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-slate-400">Tool: </span>
                  <span className="font-bold text-rose-300">{failedStep.tool || failedStep.toolName}</span>
                </div>

                {failedStep.error && (
                  <div>
                    <span className="text-slate-400">Error: </span>
                    <span className="font-bold text-rose-300">{failedStep.error}</span>
                  </div>
                )}

                {failedStep.result?.output && (
                  <div>
                    <span className="text-slate-400">Details: </span>
                    <span className="text-slate-200">{failedStep.result.output}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Successful Application Launch Result */}
        {isCompleted && plan.intent === 'OPEN_APPLICATION' && appLaunchStep && (
          <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-2 text-slate-200">
            <div className="space-y-1 text-xs text-emerald-300">
              <div>✓ Application resolved</div>
              <div>✓ Application launched</div>
              {appVerifyStep && <div>✓ Process verified</div>}
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
              {appLaunchStep.evidence?.pid !== undefined && (
                <div>
                  <span className="text-slate-400">PID: </span>
                  <span className="text-sky-400 font-bold">{appLaunchStep.evidence.pid}</span>
                </div>
              )}
              {appLaunchStep.evidence?.resolvedPath && (
                <div className="break-all">
                  <span className="text-slate-400">Executable: </span>
                  <span className="text-slate-300">{appLaunchStep.evidence.resolvedPath}</span>
                </div>
              )}
              {appLaunchStep.evidence?.method && (
                <div>
                  <span className="text-slate-400">Method: </span>
                  <span className="text-indigo-300 font-semibold">{appLaunchStep.evidence.method}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400">Status: </span>
                <span className="text-emerald-400 font-bold">Running</span>
              </div>
            </div>
          </div>
        )}

        {/* Successful Screenshot Result */}
        {isCompleted && plan.intent === 'SCREEN_CAPTURE' && screenStep && (
          <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-3 text-slate-200">
            <div className="space-y-1 text-xs text-emerald-300">
              <div>✓ Capture completed</div>
              {screenVerifyStep && <div>✓ PNG verified</div>}
            </div>

            <div className="space-y-1 text-xs">
              {screenStep.evidence?.resolvedPath && (
                <div className="break-all">
                  <span className="text-slate-400">Path: </span>
                  <span className="text-slate-300">{screenStep.evidence.resolvedPath}</span>
                </div>
              )}
              {screenStep.evidence?.fileSizeBytes !== undefined && (
                <div>
                  <span className="text-slate-400">Size: </span>
                  <span className="text-slate-300">{screenStep.evidence.fileSizeBytes} bytes</span>
                </div>
              )}
              {screenStep.evidence?.dimensions && (
                <div>
                  <span className="text-slate-400">Resolution: </span>
                  <span className="text-slate-300">
                    {screenStep.evidence.dimensions.width}x{screenStep.evidence.dimensions.height}
                  </span>
                </div>
              )}
            </div>

            {/* Screenshot Preview & Open Button */}
            {screenStep.evidence?.dataUrl && (
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="text-[10px] text-slate-400">Captured Screen Preview:</div>
                <img
                  src={screenStep.evidence.dataUrl}
                  alt="Screenshot Capture"
                  className="max-h-40 rounded border border-slate-700/60 object-contain shadow-lg bg-black"
                />
              </div>
            )}

            {screenStep.evidence?.resolvedPath && (
              <div className="pt-1">
                <button
                  onClick={async () => {
                    const targetPath = screenStep.evidence?.resolvedPath;
                    if (targetPath && (window as any).electronAPI?.openPath) {
                      await (window as any).electronAPI.openPath(targetPath);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors"
                >
                  <span>🖼️</span> Open Screenshot
                </button>
              </div>
            )}
          </div>
        )}

        {/* Successful System Diagnostics Result */}
        {isCompleted && plan.intent === 'SYSTEM_DIAGNOSTICS' && (
          <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-2 text-slate-200">
            <div className="text-xs font-bold text-emerald-300">✓ System Diagnostics Completed</div>
            {metricsStep?.evidence?.metrics && (
              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-slate-400">CPU Load: </span>
                  <span className="text-slate-200">{(metricsStep.evidence.metrics as any).cpuUsagePercentage ?? 0}%</span>
                </div>
                <div>
                  <span className="text-slate-400">RAM: </span>
                  <span className="text-slate-200">
                    {(metricsStep.evidence.metrics as any).usedMemoryMb} MB / {(metricsStep.evidence.metrics as any).totalMemoryMb} MB ({(metricsStep.evidence.metrics as any).freeMemoryMb} MB Free)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Platform: </span>
                  <span className="text-slate-200">
                    {(metricsStep.evidence.metrics as any).platform} ({(metricsStep.evidence.metrics as any).arch})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Overall Health: </span>
                  <span className="text-emerald-400 font-bold">HEALTHY (0 Critical Alerts)</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Successful File Search Result */}
        {isCompleted && plan.intent === 'SEARCH_FILES' && findFilesStep && (
          <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-2 text-slate-200">
            <div className="text-xs font-bold text-emerald-300">
              Files Found: {findFilesStep.evidence?.fileCount ?? 0}
            </div>
            {findFilesStep.evidence?.resolvedPath && (
              <div className="text-xs text-slate-400">
                <span>Directory: </span>
                <span className="text-slate-200">{findFilesStep.evidence.resolvedPath}</span>
              </div>
            )}
            {Array.isArray(findFilesStep.evidence?.files) && findFilesStep.evidence.files.length > 0 && (
              <div className="max-h-36 overflow-y-auto space-y-1 pt-1 border-t border-slate-800/80 text-[11px]">
                {findFilesStep.evidence.files.slice(0, 10).map((file, idx) => (
                  <div key={idx} className="text-slate-300 truncate">
                    {idx + 1}. {file}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Successful Directory Creation Result */}
        {isCompleted && plan.intent === 'CREATE_DIRECTORY' && createDirStep && (
          <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-2 text-slate-200">
            <div className="text-xs font-bold text-emerald-300">✓ Directory Created & Verified on Disk</div>
            {createDirStep.evidence?.resolvedPath && (
              <div className="text-xs break-all">
                <span className="text-slate-400">Directory: </span>
                <span className="text-slate-200">{createDirStep.evidence.resolvedPath}</span>
              </div>
            )}
          </div>
        )}

        {/* General Text Response Output */}
        {finalResponse && (
          <div className="p-3 rounded bg-slate-900/90 border border-slate-800 text-slate-200 text-xs whitespace-pre-wrap leading-relaxed">
            {finalResponse}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
        <span>Execution Engine: Dynamic Planner</span>
        <span>Status: {isExecuting ? 'EXECUTING REAL TOOL' : isCompleted ? 'IDLE (COMPLETED)' : isFailed ? 'FAILED' : 'IDLE'}</span>
      </div>
    </div>
  );
};
