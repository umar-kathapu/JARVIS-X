import React, { useEffect, useState } from 'react';
import { Sidebar, Button } from '@jarvis-x/ui';
import { useAppStore } from './store/useAppStore';
import { DashboardPage } from './components/pages/DashboardPage';
import { AiAgentsPage } from './components/pages/AiAgentsPage';
import { AgentTasksPage } from './components/pages/AgentTasksPage';
import { DesktopSettingsPage } from './components/pages/DesktopSettingsPage';

export const App: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();
  const [isCopied, setIsCopied] = useState(false);
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

  const fetchMetrics = () => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.getSystemMetrics().then((res: any) => {
        if (res) setMetrics(res);
      });
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendNotification = () => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.sendNotification({
        title: 'JARVIS-X Desktop AI OS',
        body: 'Native OS Integration active. Global Hotkey: Ctrl+Alt+J',
      });
    }
  };

  const handleCopyTelemetry = async () => {
    const telemetry = JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        metrics,
        version: '1.0.1',
        activeTab,
      },
      null,
      2,
    );
    if ((window as any).electronAPI) {
      await (window as any).electronAPI.writeClipboard(telemetry);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', active: activeTab === 'dashboard' },
    { id: 'agents', label: 'AI Agents', icon: '🤖', active: activeTab === 'agents' },
    { id: 'tasks', label: 'Agent Tasks', icon: '⚡', active: activeTab === 'tasks' },
    { id: 'settings', label: 'Desktop Settings', icon: '⚙️', active: activeTab === 'settings' },
  ];

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'System Dashboard';
      case 'agents':
        return 'AI Agents & Planning Engine';
      case 'tasks':
        return 'Agent Tasks & Automation';
      case 'settings':
        return 'Desktop & OS Settings';
      default:
        return tab;
    }
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            metrics={metrics}
            onRefreshMetrics={fetchMetrics}
            onSendNotification={handleSendNotification}
            onCopyTelemetry={handleCopyTelemetry}
            isCopied={isCopied}
          />
        );
      case 'agents':
        return <AiAgentsPage />;
      case 'tasks':
        return <AgentTasksPage />;
      case 'settings':
        return <DesktopSettingsPage />;
      default:
        return (
          <DashboardPage
            metrics={metrics}
            onRefreshMetrics={fetchMetrics}
            onSendNotification={handleSendNotification}
            onCopyTelemetry={handleCopyTelemetry}
            isCopied={isCopied}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      <Sidebar items={sidebarItems} onSelect={setActiveTab} brandName="JARVIS-X OS" />

      <main className="flex-1 p-8 overflow-y-auto space-y-6">
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{getPageTitle(activeTab)}</h1>
            <p className="text-xs text-slate-400 mt-1">Native AI Operating System Integration</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Hotkey: Ctrl+Alt+J
            </span>
            <Button variant="primary" size="sm" onClick={handleSendNotification}>
              Test Notification
            </Button>
          </div>
        </header>

        {renderActivePage()}
      </main>
    </div>
  );
};

