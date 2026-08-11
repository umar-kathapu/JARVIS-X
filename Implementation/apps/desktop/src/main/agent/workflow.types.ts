import {
  IntentType,
  SecurityLevel,
  ToolExecutionEvidence,
  ToolExecutionResult,
} from './agent.types.js';

export type WorkflowStepStatus =
  | 'PENDING'
  | 'READY'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED'
  | 'CANCELLED'
  | 'SKIPPED';

export type WorkflowStatus =
  | 'PENDING'
  | 'READY'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED'
  | 'CANCELLED'
  | 'PARTIAL';

export interface WorkflowStep {
  stepId: string;
  description: string;
  intent: IntentType;
  tool: string;
  input: Record<string, unknown>;
  dependencies: string[];
  securityLevel: SecurityLevel;
  status: WorkflowStepStatus;
  startedAt?: number;
  completedAt?: number;
  duration?: number;
  durationMs?: number;
  output?: string;
  result?: ToolExecutionResult;
  evidence?: ToolExecutionEvidence;
  verified?: boolean;
  verificationDetails?: string;
  error?: string;
  blockedReason?: string;
  retryCount?: number;
  maxRetries?: number;
  retryable?: boolean;
}

export interface WorkflowFinalResult {
  summary: string;
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  blockedSteps: number;
  skippedSteps: number;
  cancelledSteps: number;
  evidence: string[];
  isSuccess: boolean;
}

export interface WorkflowInstance {
  workflowId: string;
  originalGoal: string;
  intent: IntentType;
  status: WorkflowStatus;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  steps: WorkflowStep[];
  finalResult?: WorkflowFinalResult;
}

export interface WorkflowProgressUpdate {
  workflowId: string;
  workflow: WorkflowInstance;
  currentStepId?: string;
  stepUpdate?: WorkflowStep;
  finalResult?: WorkflowFinalResult;
  isComplete: boolean;
}
