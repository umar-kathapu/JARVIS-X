export type NodeType = 'TRIGGER' | 'ACTION' | 'CONDITION' | 'LOOP' | 'SUB_WORKFLOW';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  name: string;
  actionOrTriggerId: string;
  parameters: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  condition?: string; // Expression for conditional branching
}

export interface WorkflowVariable {
  key: string;
  value: unknown;
  isSecret?: boolean;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  variables: Record<string, unknown>;
  nodeResults: Record<string, unknown>;
  logs: string[];
}

export interface ExecutionResult {
  executionId: string;
  workflowId: string;
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  nodeResults: Record<string, unknown>;
  errorMessage?: string;
  durationMs: number;
}
