# 07_Automation

## Purpose
The `07_Automation` folder contains the background task queue and workflow automation engine for JARVIS-X. Powered by BullMQ, Redis 7.x, Node.js 22 LTS, and Playwright, it executes scheduled cron workflows, reactive event triggers, file system watcher tasks, and headless web browser scraping.

---

## Responsibilities
- **Async Job Processing**: Offloading long-running background workloads (vector embeddings, document parsing) to BullMQ worker threads.
- **Workflow Scheduling**: Evaluating cron specs (`node-cron`) and scheduling repeatable background tasks.
- **Desktop OS Automation**: Automating local file movement, folder watching (`chokidar`), clipboard operations, and system notifications.
- **Browser Web Automation**: Driving headless Chromium instances via Playwright for form filling, scraping, and PDF downloads.
- **AI Task DAG Execution**: Executing multi-step task graphs generated dynamically by the AI Brain.

---

## Files Created in this Folder
- `src/queue/`: BullMQ queue initializer and Redis connection manager (`queue.manager.ts`).
- `src/workers/`: Worker thread process handlers (`embedding.worker.ts`, `automation.worker.ts`).
- `src/scheduler/`: Cron task scheduler and trigger event evaluators.
- `src/desktop/`: File system watcher, clipboard automation, and OS shortcut modules.
- `src/browser/`: Playwright headless browser navigation and web scraping wrappers.
- `src/types/`: Workflow definition interfaces (`WorkflowDefinition`, `WorkflowTask`).

---

## Development Workflow
1. Navigate to `Implementation/07_Automation/`.
2. Ensure Redis container is running (`docker compose up -d redis`).
3. Run `pnpm dev` to launch background worker processes with auto-reload.
4. Run `pnpm run test:automation` to execute workflow execution unit and integration tests.

---

## System Integration
The Automation Engine consumes task jobs dispatched by `02_Backend`, executes multi-step task graphs planned by `04_AI`, interacts with local storage in `03_Database`, triggers skills exposed by `06_Plugins`, and sends completion notifications to `01_Frontend` and `08_Desktop`.
