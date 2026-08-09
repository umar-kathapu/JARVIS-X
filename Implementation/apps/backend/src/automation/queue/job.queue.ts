import { QueueJob, JobPriority } from '../types/queue.types.js';
import { logger } from '../../utils/logger.js';

export class JobQueue {
  private queue: QueueJob[] = [];
  private deadLetterQueue: QueueJob[] = [];

  enqueue(workflowId: string, payload: unknown, priority: JobPriority = 'NORMAL'): QueueJob {
    const job: QueueJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      workflowId,
      priority,
      data: payload,
      retryCount: 0,
      maxRetries: 3,
      status: 'QUEUED',
      scheduledAt: new Date().toISOString(),
    };

    this.queue.push(job);
    this.sortQueue();
    logger.info(`Enqueued job '${job.id}' for workflow '${workflowId}' with priority ${priority}`);
    return job;
  }

  dequeue(): QueueJob | undefined {
    return this.queue.shift();
  }

  moveToDLQ(job: QueueJob, errorMessage: string): void {
    job.status = 'DLQ';
    job.errorMessage = errorMessage;
    this.deadLetterQueue.push(job);
    logger.error(`Job '${job.id}' moved to Dead Letter Queue: ${errorMessage}`);
  }

  private sortQueue(): void {
    const priorityWeight: Record<JobPriority, number> = {
      CRITICAL: 4,
      HIGH: 3,
      NORMAL: 2,
      LOW: 1,
    };

    this.queue.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  getDLQLength(): number {
    return this.deadLetterQueue.length;
  }

  clear(): void {
    const pendingCount = this.queue.length;
    this.queue = [];
    logger.info(`Cleared background job queue (${pendingCount} pending jobs drained).`);
  }
}

export const jobQueue = new JobQueue();
