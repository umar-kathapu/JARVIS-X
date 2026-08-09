export type SecurityLevel = 'SAFE' | 'CONFIRM_REQUIRED' | 'SENSITIVE' | 'BLOCKED';

export type StepStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'BLOCKED'
  | 'WAITING_FOR_USER'
  | 'CANCELLED';

export type IntentType =
  | 'OPEN_APPLICATION'
  | 'OPEN_URL'
  | 'SEARCH_WEB'
  | 'CREATE_DIRECTORY'
  | 'CREATE_FILE'
  | 'READ_FILE'
  | 'SEARCH_FILES'
  | 'LIST_FILES'
  | 'DELETE_FILE'
  | 'SYSTEM_METRICS'
  | 'SYSTEM_DIAGNOSTICS'
  | 'CHECK_SOFTWARE'
  | 'PROCESS_QUERY'
  | 'SCREEN_CAPTURE'
  | 'CLIPBOARD_READ'
  | 'CLIPBOARD_WRITE'
  | 'NOTIFICATION'
  | 'TERMINAL_COMMAND'
  | 'MUSIC_LIBRARY_SCAN'
  | 'MEMORY_QUERY'
  | 'MEMORY_SAVE'
  | 'UNKNOWN';

export interface ExtractedEntities {
  appName?: string;
  url?: string;
  searchQuery?: string;
  path?: string;
  folderName?: string;
  fileName?: string;
  filePattern?: string;
  command?: string;
  commandArgs?: string[];
  softwareName?: string;
  text?: string;
  notificationTitle?: string;
  notificationBody?: string;
  memoryKey?: string;
  memoryContent?: string;
}

export interface ParsedGoalIntent {
  rawGoal: string;
  primaryIntent: IntentType;
  secondaryIntents?: IntentType[];
  entities: ExtractedEntities;
  confidence: number;
}

export interface ToolParameterSchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  category:
    | 'APPLICATION'
    | 'BROWSER'
    | 'FILESYSTEM'
    | 'SYSTEM'
    | 'PROCESS'
    | 'WINDOW'
    | 'CLIPBOARD'
    | 'SCREEN'
    | 'NOTIFICATION'
    | 'TERMINAL'
    | 'MUSIC'
    | 'MEMORY'
    | 'AUTOMATION';
  parameters: ToolParameterSchema[];
  securityLevel: SecurityLevel;
}

export interface ToolExecutionEvidence {
  verified: boolean;
  verificationDetails: string;
  resolvedPath?: string;
  requestedPath?: string;
  pid?: number;
  processName?: string;
  method?: 'APPLICATION_LAUNCH' | 'URI_LAUNCH' | 'BROWSER_FALLBACK';
  url?: string;
  exitCode?: number;
  metrics?: Record<string, unknown>;
  fileCount?: number;
  files?: string[];
  fileSizeBytes?: number;
  dimensions?: { width: number; height: number };
  dataUrl?: string;
  [key: string]: unknown;
}

export interface ToolExecutionResult {
  success: boolean;
  status: 'COMPLETED' | 'FAILED' | 'BLOCKED';
  tool: string;
  action: string;
  parameters: Record<string, unknown>;
  output: string;
  result?: Record<string, unknown>;
  evidence: ToolExecutionEvidence;
  error?: string;
}

export interface IAgentTool {
  readonly definition: ToolDefinition;
  execute(args: Record<string, unknown>): Promise<ToolExecutionResult>;
  verify?(result: ToolExecutionResult): Promise<boolean>;
}

export interface PlanStep {
  stepNumber: number;
  description: string;
  toolName: string;
  toolArgs: Record<string, unknown>;
  securityLevel: SecurityLevel;
  status: StepStatus;
  startTime?: number;
  endTime?: number;
  durationMs?: number;
  result?: ToolExecutionResult;
}

export interface AgentExecutionPlan {
  goalId: string;
  rawGoal: string;
  intent: IntentType;
  steps: PlanStep[];
  status: StepStatus;
  createdAt: number;
}

export interface AgentExecutionProgressUpdate {
  goalId: string;
  plan: AgentExecutionPlan;
  currentStepIndex: number;
  stepUpdate?: PlanStep;
  finalResponse?: string;
  isComplete: boolean;
}
