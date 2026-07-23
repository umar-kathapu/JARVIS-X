export type JobPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export type QueueStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'DLQ';

export interface QueueJob<T = unknown> {
  id: string;
  workflowId: string;
  priority: JobPriority;
  data: T;
  retryCount: number;
  maxRetries: number;
  status: QueueStatus;
  scheduledAt: string;
  processedAt?: string;
  errorMessage?: string;
}
