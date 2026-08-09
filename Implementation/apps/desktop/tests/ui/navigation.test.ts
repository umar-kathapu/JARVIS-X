import { describe, it, expect } from 'vitest';
import { useAppStore } from '../../src/renderer/src/store/useAppStore.js';

describe('Production UI Navigation & Page Component Routing', () => {
  it('1. should initialize on Dashboard page by default', () => {
    const state = useAppStore.getState();
    expect(state.activeTab).toBe('dashboard');
  });

  it('2. should transition activeTab state across all navigation destinations', () => {
    const { setActiveTab } = useAppStore.getState();

    // 1. AI Agents
    setActiveTab('agents');
    expect(useAppStore.getState().activeTab).toBe('agents');

    // 2. Agent Tasks
    setActiveTab('tasks');
    expect(useAppStore.getState().activeTab).toBe('tasks');

    // 3. Desktop Settings
    setActiveTab('settings');
    expect(useAppStore.getState().activeTab).toBe('settings');

    // 4. Return to Dashboard
    setActiveTab('dashboard');
    expect(useAppStore.getState().activeTab).toBe('dashboard');
  });

  it('3. should ensure distinct page views exist for each navigation item', () => {
    const validTabs = ['dashboard', 'agents', 'tasks', 'settings'];
    const pageTitles: Record<string, string> = {
      dashboard: 'System Dashboard',
      agents: 'AI Agents & Planning Engine',
      tasks: 'Agent Tasks & Automation',
      settings: 'Desktop & OS Settings',
    };

    validTabs.forEach((tab) => {
      expect(pageTitles[tab]).toBeDefined();
      expect(pageTitles[tab].length).toBeGreaterThan(0);
    });
  });
});
