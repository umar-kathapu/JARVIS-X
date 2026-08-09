import React from 'react';
import { Card, Button } from '@jarvis-x/ui';

interface DashboardPageProps {
  metrics: {
    cpuUsagePercentage: number;
    usedMemoryMb: number;
    totalMemoryMb: number;
    platform: string;
  };
  onRefreshMetrics: () => void;
  onSendNotification: () => void;
  onCopyTelemetry: () => void;
  isCopied: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  metrics,
  onRefreshMetrics,
  onSendNotification,
  onCopyTelemetry,
  isCopied,
}) => {
  const memoryPercentage = Math.round((metrics.usedMemoryMb / (metrics.totalMemoryMb || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* 1. Core System Resource Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="CPU Usage" subtitle={`OS Platform: ${metrics.platform}`}>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-indigo-400">
              {metrics.cpuUsagePercentage}%
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Realtime Load
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(metrics.cpuUsagePercentage, 100)}%` }}
            />
          </div>
        </Card>

        <Card title="RAM Allocation" subtitle={`Total Physical: ${metrics.totalMemoryMb} MB`}>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-emerald-400">
              {metrics.usedMemoryMb} MB
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              {memoryPercentage}% Used
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-4 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(memoryPercentage, 100)}%` }}
            />
          </div>
        </Card>

        <Card title="Desktop System" subtitle="Tray, IPC & Global Hotkeys">
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-sky-400">ONLINE</div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
              Fastify Backend
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Context Bridge & Native OS IPC channels operational.
          </p>
        </Card>
      </section>

      {/* 2. Subsystem Telemetry & Quick Action Hub */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Subsystem Health" subtitle="Core services runtime state">
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="text-sm font-medium text-slate-200">AI Core Reasoning Engine</span>
              </div>
              <span className="text-xs text-slate-400">llama3 / ollama</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="text-sm font-medium text-slate-200">Workflow & Automation Engine</span>
              </div>
              <span className="text-xs text-slate-400">Priority Queue Active</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="text-sm font-medium text-slate-200">Lifelong Memory & Knowledge Store</span>
              </div>
              <span className="text-xs text-slate-400">In-Memory / SQLite Fallback</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                <span className="text-sm font-medium text-slate-200">IPC Security & Context Isolation</span>
              </div>
              <span className="text-xs text-slate-400">Frame Validated</span>
            </div>
          </div>
        </Card>

        <Card title="Quick Telemetry Actions" subtitle="Native OS Controls & Diagnostic Tools">
          <div className="mt-4 flex flex-col gap-3">
            <Button variant="outline" onClick={onRefreshMetrics} className="justify-start gap-2">
              <span>🔄</span> Refresh System Telemetry
            </Button>

            <Button variant="outline" onClick={onCopyTelemetry} className="justify-start gap-2">
              <span>📋</span> {isCopied ? 'Telemetry Copied to Clipboard!' : 'Copy Telemetry to Clipboard'}
            </Button>

            <Button variant="primary" onClick={onSendNotification} className="justify-start gap-2">
              <span>🔔</span> Dispatch Native OS Notification
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
};
