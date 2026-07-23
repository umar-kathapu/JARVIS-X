export interface AutomationJob {
  id: string;
  name: string;
  cronExpression: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

export interface IAutomationEngine {
  scheduleJob(job: AutomationJob): Promise<void>;
  cancelJob(jobId: string): Promise<void>;
}
