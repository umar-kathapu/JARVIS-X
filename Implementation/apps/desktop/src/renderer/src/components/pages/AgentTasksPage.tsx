import React, { useState } from 'react';
import { Card, Button } from '@jarvis-x/ui';

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  version: string;
  nodeCount: number;
  triggerType: string;
}

interface ExecutionLog {
  id: string;
  workflowName: string;
  status: 'SUCCESS' | 'RUNNING' | 'QUEUED';
  durationMs: number;
  timestamp: string;
}

export const AgentTasksPage: React.FC = () => {
  const [runningWfId, setRunningWfId] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([
    {
      id: 'exec_init_01',
      workflowName: 'System Health Diagnostic & Auto-Backup Workflow',
      status: 'SUCCESS',
      durationMs: 420,
      timestamp: 'Just now',
    },
    {
      id: 'exec_init_02',
      workflowName: 'Hourly System Cleanup & Cache Flush',
      status: 'SUCCESS',
      durationMs: 185,
      timestamp: '1 hour ago',
    },
  ]);

  const workflows: WorkflowItem[] = [
    {
      id: 'wf_sys_health_diag',
      name: 'System Health Diagnostic & Auto-Backup Workflow',
      description: 'Automated system diagnostic scan, memory backup, and desktop notification dispatch.',
      version: '1.0.0',
      nodeCount: 4,
      triggerType: 'Manual / On-Demand',
    },
    {
      id: 'wf_hourly_cleanup',
      name: 'Hourly System Cleanup & Cache Flush',
      description: 'Clears transient scratch memory, optimizes SQLite store, and purges expired tokens.',
      version: '1.0.0',
      nodeCount: 3,
      triggerType: 'Cron [0 * * * *]',
    },
    {
      id: 'wf_audio_index',
      name: 'Audio Library Metadata Indexing',
      description: 'Scans configured directories for audio files, extracts ID3 tags, and builds search index.',
      version: '1.0.0',
      nodeCount: 3,
      triggerType: 'File Watcher',
    },
  ];

  const handleRunWorkflow = async (wf: WorkflowItem) => {
    setRunningWfId(wf.id);

    const execId = `exec_${Date.now()}`;
    const startTime = performance.now();

    // Add queued log
    const newLog: ExecutionLog = {
      id: execId,
      workflowName: wf.name,
      status: 'RUNNING',
      durationMs: 0,
      timestamp: 'Executing...',
    };
    setExecutionLogs((prev) => [newLog, ...prev]);

    // Simulate pipeline node execution
    await new Promise((r) => setTimeout(r, 900));

    const duration = Math.round(performance.now() - startTime);

    setExecutionLogs((prev) =>
      prev.map((log) =>
        log.id === execId
          ? {
              ...log,
              status: 'SUCCESS',
              durationMs: duration,
              timestamp: 'Just now',
            }
          : log,
      ),
    );

    setRunningWfId(null);

    // Dispatch native notification via Electron IPC
    if ((window as any).electronAPI) {
      (window as any).electronAPI.sendNotification({
        title: 'JARVIS-X Workflow Engine',
        body: `Workflow "${wf.name}" completed successfully in ${duration}ms.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Automation Engine Status & Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Workflow Engine" subtitle="Priority Job Queue">
          <div className="mt-4">
            <div className="text-xl font-bold text-indigo-400">3 Workflows</div>
            <div className="text-xs text-slate-400 mt-1">Status: Active & Polling</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">0 PENDING JOBS</span>
          </div>
        </Card>

        <Card title="Cron Scheduler" subtitle="Autonomous Scheduled Tasks">
          <div className="mt-4">
            <div className="text-xl font-bold text-emerald-400">Hourly Active</div>
            <div className="text-xs text-slate-400 mt-1">Schedule: 0 * * * *</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">RUNNING</span>
          </div>
        </Card>

        <Card title="Checkpoint Recovery" subtitle="Fault-Tolerant State Store">
          <div className="mt-4">
            <div className="text-xl font-bold text-sky-400">Auto-Recovery</div>
            <div className="text-xs text-slate-400 mt-1">State Persistence Enabled</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-xs font-semibold text-sky-400">PERSISTENT</span>
          </div>
        </Card>
      </section>

      {/* 2. Registered Workflows */}
      <Card title="Automation Workflows" subtitle="Executable task pipelines and scheduled automation jobs">
        <div className="mt-4 space-y-4">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-950/70 border border-slate-800 gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-100">{wf.name}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    v{wf.version}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{wf.description}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span>{wf.nodeCount} Pipeline Nodes</span>
                  <span>•</span>
                  <span>Trigger: {wf.triggerType}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleRunWorkflow(wf)}
                isLoading={runningWfId === wf.id}
                disabled={runningWfId !== null}
                className="shrink-0 w-full sm:w-auto"
              >
                Run Workflow
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Workflow Execution History / Console */}
      <Card title="Execution History & Logs" subtitle="Real-time execution telemetry and completed run records">
        <div className="mt-4 space-y-3">
          {executionLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 font-mono text-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    log.status === 'SUCCESS' ? 'bg-emerald-400' : 'bg-indigo-400 animate-ping'
                  }`}
                />
                <span className="text-slate-200 font-sans font-medium">{log.workflowName}</span>
              </div>

              <div className="flex items-center gap-4 text-slate-400">
                {log.durationMs > 0 && <span>{log.durationMs}ms</span>}
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.status === 'SUCCESS'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  {log.status}
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
