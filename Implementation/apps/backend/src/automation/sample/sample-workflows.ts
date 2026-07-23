import { WorkflowDefinition } from '../types/workflow.types.js';

export const SystemHealthDiagnosticWorkflow: WorkflowDefinition = {
  id: 'wf_sys_health_diag',
  name: 'System Health Diagnostic & Auto-Backup Workflow',
  description: 'Automated system diagnostic scan, memory backup, and desktop notification dispatch.',
  version: '1.0.0',
  isPublished: true,
  createdAt: '2026-07-01T00:00:00Z',
  updatedAt: '2026-07-20T00:00:00Z',
  variables: [
    { key: 'targetHost', value: 'localhost' },
    { key: 'autoNotify', value: true },
  ],
  nodes: [
    {
      id: 'node_trigger',
      type: 'TRIGGER',
      name: 'System Diagnostic Trigger',
      actionOrTriggerId: 'manual_trigger',
      parameters: {},
    },
    {
      id: 'node_ai_diag',
      type: 'ACTION',
      name: 'AI System Analysis',
      actionOrTriggerId: 'ai_prompt',
      parameters: { prompt: 'Analyze system status metrics and summarize memory state.' },
    },
    {
      id: 'node_save_memory',
      type: 'ACTION',
      name: 'Save Diagnostic Memory',
      actionOrTriggerId: 'memory_save',
      parameters: { key: 'diagnostic_log', content: 'Diagnostic analysis generated.' },
    },
    {
      id: 'node_notify',
      type: 'ACTION',
      name: 'Dispatch Desktop Notification',
      actionOrTriggerId: 'desktop_notification',
      parameters: { title: 'JARVIS-X System Scan', message: 'Diagnostic workflow finished successfully.' },
    },
  ],
  edges: [
    { id: 'e1', sourceNodeId: 'node_trigger', targetNodeId: 'node_ai_diag' },
    { id: 'e2', sourceNodeId: 'node_ai_diag', targetNodeId: 'node_save_memory' },
    { id: 'e3', sourceNodeId: 'node_save_memory', targetNodeId: 'node_notify' },
  ],
};

export const sampleWorkflows: WorkflowDefinition[] = [SystemHealthDiagnosticWorkflow];
