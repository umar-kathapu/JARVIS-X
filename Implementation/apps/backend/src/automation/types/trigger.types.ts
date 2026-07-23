export type TriggerType =
  | 'CRON'
  | 'INTERVAL'
  | 'APP_STARTUP'
  | 'AI_RESPONSE'
  | 'MEMORY_UPDATED'
  | 'PLUGIN_EVENT'
  | 'FILESYSTEM'
  | 'WEBHOOK'
  | 'MANUAL';

export interface TriggerDefinition {
  id: string;
  type: TriggerType;
  config: Record<string, unknown>;
  enabled: boolean;
}
