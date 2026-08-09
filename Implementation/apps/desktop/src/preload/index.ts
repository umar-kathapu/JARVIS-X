import { contextBridge, ipcRenderer } from 'electron';

export const electronAPI = {
  getSystemMetrics: () => ipcRenderer.invoke('GET_SYSTEM_METRICS'),
  setAlwaysOnTop: (flag: boolean) => ipcRenderer.invoke('SET_ALWAYS_ON_TOP', Boolean(flag)),
  getWindowState: () => ipcRenderer.invoke('GET_WINDOW_STATE'),
  sendNotification: (payload: { title: string; body: string }) =>
    ipcRenderer.invoke('SEND_NOTIFICATION', {
      title: String(payload?.title || ''),
      body: String(payload?.body || ''),
    }),
  readClipboard: () => ipcRenderer.invoke('READ_CLIPBOARD'),
  writeClipboard: (text: string) => ipcRenderer.invoke('WRITE_CLIPBOARD', String(text || '')),
  selectFile: () => ipcRenderer.invoke('SELECT_FILE'),
  executeTerminal: (commandOrPayload: string | { command: string; args?: string[] }) => {
    const payload =
      typeof commandOrPayload === 'string' ? { command: commandOrPayload } : commandOrPayload;
    return ipcRenderer.invoke('EXECUTE_TERMINAL', payload);
  },
  captureScreen: () => ipcRenderer.invoke('CAPTURE_SCREEN'),
  executeAgentGoal: (goal: string) =>
    ipcRenderer.invoke('AGENT_EXECUTE_GOAL', { goal: String(goal || '') }),
  getAgentTools: () => ipcRenderer.invoke('AGENT_GET_TOOLS'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

