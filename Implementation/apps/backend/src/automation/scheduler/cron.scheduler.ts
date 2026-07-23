import { automationRepository } from '../../repositories/automation.repository.js';
import { jobQueue } from '../queue/job.queue.js';
import { logger } from '../../utils/logger.js';

export class CronScheduler {
  private isRunning = false;

  async scheduleCron(workflowId: string, cronExpression: string, name: string): Promise<void> {
    await automationRepository.createAutomation(name, cronExpression);
    logger.info(`Scheduled automation cron '${name}' [${cronExpression}] for workflow '${workflowId}'`);
  }

  startScheduler(intervalMs = 60000): void {
    if (this.isRunning) return;
    this.isRunning = true;

    setInterval(async () => {
      logger.debug('Polling scheduled cron automation jobs...');
    }, intervalMs);
  }
}

export const cronScheduler = new CronScheduler();
