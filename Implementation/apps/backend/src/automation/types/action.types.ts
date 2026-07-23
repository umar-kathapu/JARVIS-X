export interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  parametersSchema: Record<string, unknown>;
}

export interface ActionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  executionTimeMs: number;
}

export interface IAction {
  readonly definition: ActionDefinition;
  execute(params: Record<string, unknown>, context: Record<string, unknown>): Promise<ActionResult>;
}
