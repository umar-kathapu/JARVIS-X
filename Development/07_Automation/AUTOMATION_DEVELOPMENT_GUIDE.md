# Automation Development Guide

Welcome to the **JARVIS-X** Automation Development Guide. JARVIS-X is an enterprise-grade, Iron Man-inspired AI Operating System designed to deliver real-time multi-modal intelligence, voice interface control, computer vision perception, autonomous task execution, and desktop integration.

This document serves as the official, implementation-ready architectural manual for designing, developing, executing, securing, testing, and scaling the **Automation Engine** of JARVIS-X.

---

## 1. Purpose

The Automation Engine is the execution arm of JARVIS-X. It transforms natural language instructions, event triggers, cron schedules, and AI plans into automated desktop, browser, network, and system operations. Key responsibilities include:

- **Task & Workflow Scheduling**: Executing cron tasks, timers, and event-driven reactive workflows.
- **Desktop & OS Automation**: Automating local file management, clipboard interactions, native window placement, and keyboard/mouse shortcuts.
- **Browser Web Automation**: Utilizing Playwright for headless web navigation, form filling, PDF extraction, and web scraping.
- **AI-Driven Dynamic Workflows**: Decomposing natural language goals into executable task graphs with automatic error compensation.

---

## 2. Automation Vision

The vision for the JARVIS-X Automation Engine is to create a resilient, self-healing automation platform capable of running complex multi-step workflows across desktop and web environments with zero user friction.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     JARVIS-X AUTOMATION PLATFORM                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌───────────────────┐    ┌───────────────────┐    ┌────────────────┐  │
│   │ DESKTOP & OS      │    │ BROWSER ENGINE    │    │ AI DYNAMIC DAG │  │
│   │ File Watchers     │    │ Playwright Core   │    │ Task Generator │  │
│   │ Keyboard & Mouse  │    │ Form & PDF Scraper│    │ Error Rollback │  │
│   └─────────┬─────────┘    └─────────┬─────────┘    └───────┬────────┘  │
│             │                        │                      │           │
│             └────────────────────────┼──────────────────────┘           │
│                                      │                                  │
│                   ┌──────────────────▼──────────────────┐               │
│                   │      BULLMQ & REDIS TASK QUEUE      │               │
│                   │ Retries | Locks | Audit Telemetry   │               │
│                   └─────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Automation Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     AUTOMATION ENGINE ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   TRIGGER INPUTS (Cron / File Event / AI Intent / Manual UI)            │
│         │                                                               │
│         ▼                                                               │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ 1. TRIGGER MANAGER & WORKFLOW SCHEDULER                           │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                    │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │ 2. BULLMQ QUEUE & REDIS JOB BROKER                                │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                    │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │ 3. TASK EXECUTOR ENGINE                                           │  │
│  │    ├── Desktop Worker (Files, OS, Keyboard/Mouse)                 │  │
│  │    ├── Browser Worker (Playwright Headless Chrome)                │  │
│  │    └── API & Plugin Worker (REST, Webhooks, Plugin Skills)        │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                    │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │ 4. AUDIT LOGGER & NOTIFICATION SERVICE                            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AUTOMATION TECH STACK                           │
├───────────────┬──────────────────────────┬──────────────────────────────┤
│ Component     │ Technology               │ Purpose & Role               │
├───────────────┼──────────────────────────┼──────────────────────────────┤
│ Runtime       │ Node.js 22 LTS           │ Primary asynchronous engine  │
│ Language      │ TypeScript (v5.x)        │ Typed workflow definitions   │
│ Job Queue     │ BullMQ & Redis 7.x       │ Async task scheduling & lock │
│ Scheduler     │ node-cron / BullMQ Repeat│ Cron schedule evaluation     │
│ Desktop Auto  │ Electron IPC & RobotJS   │ System shortcuts & OS control│
│ Web Auto      │ Playwright               │ Headless browser automation  │
│ Event Bus     │ Redis Pub/Sub            │ Cross-process event triggers │
└───────────────┴──────────────────────────┴──────────────────────────────┘
```

---

## 5. Workflow Structure & Lifecycle

```
  ┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
  │ DEFINITION │────►│ VALIDATION │────►│ REGISTER   │────►│ TRIGGERED  │
  └────────────┘     └────────────┘     └────────────┘     └─────┬──────┘
                                                                 │
  ┌────────────┐     ┌────────────┐     ┌────────────┐           │
  │ COMPLETE   │◄────│ MONITORING │◄────│ EXECUTION  │◄──────────┘
  └────────────┘     └──────┬─────┘     └────────────┘
                            │ (On Failure)
                            ▼
                     ┌────────────┐
                     │ RETRY/FAIL │
                     └────────────┘
```

### Workflow Definition Interface

```typescript
// src/automation/types/workflow.types.ts

export type TriggerType = 'CRON' | 'FILE_WATCH' | 'EVENT' | 'MANUAL' | 'AI_INTENT';

export interface WorkflowTask {
  id: string;
  name: string;
  action: 'desktop.file_move' | 'browser.navigate' | 'browser.click' | 'ai.summarize';
  params: Record<string, any>;
  onFailure?: 'RETRY' | 'CONTINUE' | 'ROLLBACK';
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  trigger: {
    type: TriggerType;
    config: Record<string, any>;
  };
  tasks: WorkflowTask[];
  maxRetries: number;
}
```

---

## 6. Trigger System

The Trigger Manager supports multiple event trigger types:

1. **Manual Trigger**: Triggered directly by the user via HUD shortcut or UI button.
2. **Scheduled Trigger (Cron)**: Evaluates standard 5-part cron expressions (e.g., `0 9 * * 1-5` for weekdays at 9:00 AM).
3. **Event Trigger**: Fires in response to Redis Pub/Sub events (e.g., `system:telemetry:high_temp`).
4. **File System Trigger**: Uses `chokidar` to monitor local folder events (`on_file_added`, `on_file_modified`).
5. **AI Trigger**: Autonomous activation triggered when the AI Brain determines a workflow is required.

---

## 7. Task Execution Engine

The Task Executor handles sequential and parallel execution of workflow steps with built-in Saga compensation:

```typescript
// src/automation/executor.ts
import { WorkflowDefinition, WorkflowTask } from './types/workflow.types';
import { logger } from '../utils/logger';

export async function executeWorkflow(workflow: WorkflowDefinition): Promise<void> {
  logger.info({ event: 'workflow_start', workflowId: workflow.id });

  const completedTasks: WorkflowTask[] = [];

  try {
    for (const task of workflow.tasks) {
      logger.info({ event: 'task_executing', taskId: task.id, action: task.action });
      
      // Execute task handler
      await runTaskHandler(task);
      completedTasks.push(task);
    }
    logger.info({ event: 'workflow_success', workflowId: workflow.id });
  } catch (error) {
    logger.error({ event: 'workflow_error', workflowId: workflow.id, error });
    
    // Execute Rollback Saga for completed tasks
    await rollbackCompletedTasks(completedTasks);
    throw error;
  }
}
```

---

## 8. Desktop Automation

Desktop automation modules interact directly with the host operating system:

- **File Management**: `fs-extra` and `chokidar` for atomic file copying, renaming, moving, and folder monitoring.
- **Clipboard Control**: Native Electron `clipboard` API to inspect or write text and image buffers.
- **Notifications**: Desktop toast notifications sent via Electron `Notification` API.
- **Window Management**: Control window focus, minimization, and display placement.

---

## 9. Browser Automation with Playwright

Playwright drives headless chromium instances for web data extraction and web task completion:

```typescript
// src/automation/browser/playwright.service.ts
import { chromium, Browser, Page } from 'playwright';

export async function scrapeInvoicePDF(url: string, downloadPath: string): Promise<string> {
  const browser: Browser = await chromium.launch({ headless: true });
  const page: Page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Form interaction example
    await page.fill('#username', process.env.SERVICE_USER!);
    await page.fill('#password', process.env.SERVICE_PASS!);
    await page.click('button[type="submit"]');

    // Trigger PDF download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#download-invoice-btn'),
    ]);

    const filePath = `${downloadPath}/${download.suggestedFilename()}`;
    await download.saveAs(filePath);
    return filePath;
  } finally {
    await browser.close();
  }
}
```

---

## 10. AI-Powered Automation

When a user gives a high-level natural language request ("Jarvis, clean up my Downloads folder and organize files by extension"), the AI Brain generates a dynamic `WorkflowDefinition` DAG that the Automation Engine executes immediately.

---

## 11. Plugin Integration

Plugins can register custom automation actions (e.g., `plugin.spotify.play_playlist`) which the Automation Engine integrates as standard steps inside workflows.

---

## 12. Monitoring & Logging

- **Execution Logs**: All workflow runs write structured JSON logs with correlation IDs to `logs/automation.log`.
- **Metrics**: Track workflow success rate, average execution latency, and retry counts via Prometheus.

---

## 13. Security & User Consent

- **Destructive Operations Consent**: File deletion, disk formatting, or external payment web interactions require explicit UI confirmation prompts.
- **Idempotency Locks**: Redis distributed locks (`redlock`) prevent duplicate concurrent executions of the same workflow.

---

## 14. Automation Testing

```bash
# Execute Automation Engine Unit Tests
pnpm run test:automation
```

---

## 15. Best Practices

1. **Ensure Idempotency**: Design automation tasks to be safe for re-execution if retried after a network glitch.
2. **Always Close Browsers**: Guarantee `browser.close()` calls inside `finally` blocks to avoid orphaned Chrome processes.
3. **Use Explicit Timeouts**: Set maximum timeout limits (e.g., 30s) on browser navigation and network fetches.

---

## 16. Acceptance Criteria

The Automation Engine is ready for production deployment when:

- [ ] **Workflow Queue verified**: BullMQ processes background jobs reliably with Redis persistence.
- [ ] **Playwright Integration**: Headless browser automation completes login, form-fill, and file download flows.
- [ ] **Rollback Capability**: Task failure triggers Saga compensation rollback functions correctly.
- [ ] **Test Coverage**: Unit and workflow integration tests achieve minimum **80% line coverage**.

---

## 17. Conclusion

Following this Automation Development Guide ensures that the JARVIS-X Automation Engine operates reliably, safely, and efficiently. By combining BullMQ queues, Playwright web automation, desktop file controls, and AI DAG task generation, developers can build a world-class automation platform.
