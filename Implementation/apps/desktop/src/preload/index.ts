import { contextBridge, ipcRenderer } from 'electron';

export const electronAPI = {
  getSystemMetrics: () => ipcRenderer.invoke('GET_SYSTEM_METRICS'),
  setAlwaysOnTop: (flag: boolean) => ipcRenderer.invoke('SET_ALWAYS_ON_TOP', flag),
  getWindowState: () => ipcRenderer.invoke('GET_WINDOW_STATE'),
  sendNotification: (payload: { title: string; body: string }) => ipcRenderer.invoke('SEND_NOTIFICATION', payload),
  readClipboard: () => ipcRenderer.invoke('READ_CLIPBOARD'),
  writeClipboard: (text: string) => ipcRenderer.invoke('WRITE_CLIPBOARD', text),
  selectFile: () => ipcRenderer.invoke('SELECT_FILE'),
  executeTerminal: (command: string) => ipcRenderer.invoke('EXECUTE_TERMINAL', command),
  captureScreen: () => ipcRenderer.invoke('CAPTURE_SCREEN'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
