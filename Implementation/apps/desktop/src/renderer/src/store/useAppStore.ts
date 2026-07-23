import { create } from 'zustand';

export interface AppState {
  activeTab: string;
  isBackendConnected: boolean;
  systemStatus: string;
  setActiveTab: (tab: string) => void;
  setBackendConnected: (connected: boolean) => void;
  setSystemStatus: (status: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'dashboard',
  isBackendConnected: true,
  systemStatus: 'ONLINE',
  setActiveTab: (tab) => set({ activeTab: tab }),
  setBackendConnected: (connected) => set({ isBackendConnected: connected }),
  setSystemStatus: (status) => set({ systemStatus: status }),
}));
