import React, { useEffect, useState } from 'react';
import { Sidebar, Card, Button } from '@jarvis-x/ui';
import { useAppStore } from './store/useAppStore';

export const App: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();
  const [metrics, setMetrics] = useState<{
    cpuUsagePercentage: number;
    usedMemoryMb: number;
    totalMemoryMb: number;
    platform: string;
  }>({
    cpuUsagePercentage: 12,
    usedMemoryMb: 2450,
    totalMemoryMb: 16384,
    platform: 'win32',
  });

  useEffect(() => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.getSystemMetrics().then((res: any) => {
        if (res) setMetrics(res);
      });
    }
  }, []);

  const handleSendNotification = () => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.sendNotification({
        title: 'JARVIS-X Desktop AI OS',
        body: 'Native OS Integration active. Global Hotkey: Ctrl+Alt+J',
      });
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', active: activeTab === 'dashboard' },
    { id: 'agents', label: 'AI Agents', icon: '🤖', active: activeTab === 'agents' },
    { id: 'tasks', label: 'Agent Tasks', icon: '⚡', active: activeTab === 'tasks' },
    { id: 'settings', label: 'Desktop Settings', icon: '⚙️', active: activeTab === 'settings' },
  ];

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      <Sidebar items={sidebarItems} onSelect={setActiveTab} brandName="JARVIS-X OS" />

      <main className="flex-1 p-8 overflow-y-auto space-y-6">
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 capitalize">{activeTab}</h1>
            <p className="text-xs text-slate-400 mt-1">Native AI Operating System Integration</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Hotkey: Ctrl+Alt+J
            </span>
            <Button variant="primary" size="sm" onClick={handleSendNotification}>
              Test Native Notification
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-3 gap-6">
          <Card title="CPU Usage" subtitle={`OS Platform: ${metrics.platform}`}>
            <div className="mt-4 text-3xl font-extrabold text-indigo-400">
              {metrics.cpuUsagePercentage}%
            </div>
          </Card>
          <Card title="RAM Allocation" subtitle={`Total: ${metrics.totalMemoryMb} MB`}>
            <div className="mt-4 text-3xl font-extrabold text-emerald-400">
              {metrics.usedMemoryMb} MB
            </div>
          </Card>
          <Card title="Desktop System" subtitle="Tray & Global Shortcuts">
            <div className="mt-4 text-3xl font-extrabold text-sky-400">ONLINE</div>
          </Card>
        </section>
      </main>
    </div>
  );
};
