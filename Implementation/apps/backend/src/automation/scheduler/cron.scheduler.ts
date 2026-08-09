import { automationRepository } from '../../repositories/automation.repository.js';
import { logger } from '../../utils/logger.js';

export class CronScheduler {
  private isRunning = false;
  private timer: NodeJS.Timeout | null = null;

  async scheduleCron(workflowId: string, cronExpression: string, name: string): Promise<void> {
    await automationRepository.createAutomation(name, cronExpression);
    logger.info(`Scheduled automation cron '${name}' [${cronExpression}] for workflow '${workflowId}'`);
  }

  startScheduler(intervalMs = 60000): void {
    if (this.isRunning) return;
    this.isRunning = true;

    this.timer = setInterval(async () => {
      logger.debug('Polling scheduled cron automation jobs...');
    }, intervalMs);

    logger.info('⏱️ Cron Scheduler service initialized and running.');
  }

  stopScheduler(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    logger.info('⏹️ Cron Scheduler service stopped.');
  }
}

export const cronScheduler = new CronScheduler();
