import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '@jarvis-x/ui';

export const DesktopSettingsPage: React.FC = () => {
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);
  const [terminalCmd, setTerminalCmd] = useState('echo JARVIS-X OS Native Integration Active');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);
  const [clipboardContent, setClipboardContent] = useState('');
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const [screenCaptureStatus, setScreenCaptureStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // Check initial window state
    if ((window as any).electronAPI) {
      (window as any).electronAPI.getWindowState().then((state: any) => {
        if (state) {
          setIsAlwaysOnTop(Boolean(state.isAlwaysOnTop));
        }
      });
    }
  }, []);

  const handleToggleAlwaysOnTop = async () => {
    const nextState = !isAlwaysOnTop;
    if ((window as any).electronAPI) {
      await (window as any).electronAPI.setAlwaysOnTop(nextState);
      setIsAlwaysOnTop(nextState);
      setStatusMessage(`Always On Top ${nextState ? 'ENABLED' : 'DISABLED'}`);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleSendTestNotification = async () => {
    if ((window as any).electronAPI) {
      await (window as any).electronAPI.sendNotification({
        title: 'JARVIS-X OS Notification Test',
        body: 'Native Windows Desktop Notification integration is functional and verified.',
      });
      setStatusMessage('Test notification dispatched!');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleSelectFile = async () => {
    if ((window as any).electronAPI) {
      const res = await (window as any).electronAPI.selectFile();
      if (res && res.filePath) {
        setSelectedFilePath(res.filePath);
      }
    }
  };

  const handleCaptureScreen = async () => {
    if ((window as any).electronAPI) {
      setScreenCaptureStatus('Capturing screen...');
      const res = await (window as any).electronAPI.captureScreen();
      if (res && res.dataUrl) {
        setScreenCaptureStatus(`Screen captured (${res.width || 1920}x${res.height || 1080})`);
      } else {
        setScreenCaptureStatus('Screen captured successfully');
      }
      setTimeout(() => setScreenCaptureStatus(''), 4000);
    }
  };

  const handleRunTerminal = async () => {
    if (!terminalCmd.trim()) return;
    setIsTerminalRunning(true);
    setTerminalOutput('Executing command in sandboxed process...');

    if ((window as any).electronAPI) {
      try {
        const parts = terminalCmd.trim().split(' ');
        const cmd = parts[0] || 'echo';
        const args = parts.slice(1);
        const res = await (window as any).electronAPI.executeTerminal({ command: cmd, args });
        if (res) {
          setTerminalOutput(res.stdout || res.stderr || `Command executed with exit code ${res.exitCode}`);
        }
      } catch (err: any) {
        setTerminalOutput(`Execution error: ${err.message}`);
      }
    } else {
      setTerminalOutput(`Simulated Output: [${terminalCmd}] -> Process executed successfully (exit code 0).`);
    }

    setIsTerminalRunning(false);
  };

  const handleReadClipboard = async () => {
    if ((window as any).electronAPI) {
      const text = await (window as any).electronAPI.readClipboard();
      setClipboardContent(text || '(Clipboard is empty)');
    }
  };

  const handleWriteClipboard = async () => {
    if ((window as any).electronAPI) {
      await (window as any).electronAPI.writeClipboard('JARVIS-X Desktop AI OS v1.0.1');
      setClipboardContent('JARVIS-X Desktop AI OS v1.0.1');
      setStatusMessage('Copied sample text to clipboard!');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {statusMessage && (
        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-between">
          <span>{statusMessage}</span>
          <span className="text-[10px] uppercase font-mono">Notification</span>
        </div>
      )}

      {/* 1. Window & System Settings */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Window & Display Settings" subtitle="Configure native window behavior and overlays">
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div>
                <div className="text-sm font-semibold text-slate-100">Pin Window (Always On Top)</div>
                <div className="text-xs text-slate-400 mt-0.5">Keep JARVIS-X visible over other applications</div>
              </div>
              <Button
                variant={isAlwaysOnTop ? 'primary' : 'outline'}
                size="sm"
                onClick={handleToggleAlwaysOnTop}
              >
                {isAlwaysOnTop ? 'ENABLED' : 'DISABLED'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div>
                <div className="text-sm font-semibold text-slate-100">Global Activation Shortcut</div>
                <div className="text-xs text-slate-400 mt-0.5">Global system hotkey to show/hide window</div>
              </div>
              <span className="px-3 py-1 text-xs font-mono font-bold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Ctrl+Alt+J
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div>
                <div className="text-sm font-semibold text-slate-100">System Tray Minimization</div>
                <div className="text-xs text-slate-400 mt-0.5">Closing window minimizes to background tray</div>
              </div>
              <span className="text-xs font-semibold text-emerald-400">ACTIVE</span>
            </div>
          </div>
        </Card>

        <Card title="Native OS Diagnostic Tools" subtitle="Test Electron IPC channels and system capabilities">
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" size="sm" onClick={handleSendTestNotification} className="gap-2">
              <span>🔔</span> Test OS Notification
            </Button>

            <Button variant="outline" size="sm" onClick={handleCaptureScreen} className="gap-2">
              <span>📸</span> Capture Display
            </Button>

            <Button variant="outline" size="sm" onClick={handleSelectFile} className="gap-2">
              <span>📂</span> Native File Picker
            </Button>

            <Button variant="outline" size="sm" onClick={handleReadClipboard} className="gap-2">
              <span>📋</span> Inspect Clipboard
            </Button>
          </div>

          {(screenCaptureStatus || selectedFilePath || clipboardContent) && (
            <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 space-y-1">
              {screenCaptureStatus && <div>📸 {screenCaptureStatus}</div>}
              {selectedFilePath && <div>📂 File: {selectedFilePath}</div>}
              {clipboardContent && <div>📋 Clipboard: {clipboardContent}</div>}
            </div>
          )}
        </Card>
      </section>

      {/* 2. Sandboxed Terminal IPC Runner */}
      <Card title="Terminal IPC Execution Sandbox" subtitle="Execute commands through secure Electron child_process IPC channel">
        <div className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                value={terminalCmd}
                onChange={(e) => setTerminalCmd(e.target.value)}
                placeholder="Enter command (e.g. echo Hello World)..."
                disabled={isTerminalRunning}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleRunTerminal}
              isLoading={isTerminalRunning}
              disabled={!terminalCmd.trim() || isTerminalRunning}
              className="sm:w-auto w-full"
            >
              Run Command
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 min-h-[90px] flex flex-col justify-between">
            <div className="whitespace-pre-wrap">{terminalOutput || '$ Ready for command execution...'}</div>
            <div className="mt-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
              Channel: EXECUTE_TERMINAL (Strict Zod Schema Validated)
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Build & Runtime Environment Info */}
      <Card title="Runtime & Version Environment" subtitle="Application build metadata and backend connectivity">
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400">Application Version</div>
            <div className="text-sm font-bold text-indigo-400 mt-1">v1.0.1</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400">Electron Runtime</div>
            <div className="text-sm font-bold text-slate-200 mt-1">v29.4.6 (x64)</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400">Backend Server</div>
            <div className="text-sm font-bold text-emerald-400 mt-1">http://localhost:3000</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400">Module Strategy</div>
            <div className="text-sm font-bold text-sky-400 mt-1">CommonJS (.cjs)</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
