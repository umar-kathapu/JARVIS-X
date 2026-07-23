# 09_Testing

## Purpose
The `09_Testing` folder manages the automated test infrastructure, test suites, evaluation scripts, and benchmark configurations for JARVIS-X. Using Vitest, Playwright, pytest, k6, and Ragas, it guarantees system stability, security, and performance across all software layers.

---

## Responsibilities
- **Unit & Component Testing**: Running fast, isolated unit tests for UI components, helper functions, and backend services via Vitest and pytest.
- **Integration Testing**: Testing API routes, Prisma database queries, and Redis job queues against isolated Docker Testcontainers.
- **End-to-End Testing**: Driving full user flows inside web browsers and native Electron desktop windows via Playwright.
- **Performance & Load Benchmarks**: Executing k6 load scripts to measure API throughput, WebSocket latency, TTFT, and CPU/RAM usage.
- **AI & Guardrail Evaluation**: Running automated prompt injection fuzzing and RAG faithfulness evaluations via Ragas.

---

## Files Created in this Folder
- `unit/`: Vitest and pytest unit test suites (`MetricCard.test.tsx`, `prompt_builder_test.py`).
- `integration/`: Database and API route integration tests (`user.repository.test.ts`).
- `e2e/`: Playwright web and Electron end-to-end test scenarios (`desktop-hud.spec.ts`).
- `load/`: k6 load testing scripts for REST and WebSocket endpoints (`websocket-telemetry.js`).
- `evals/`: AI evaluation suites and prompt injection security benchmarks (`ragas_eval.py`).
- `vitest.config.ts`: Vitest global test runner configuration.
- `playwright.config.ts`: Playwright multi-browser and Electron test runner configuration.

---

## Development Workflow
1. Navigate to `Implementation/09_Testing/`.
2. Run `pnpm test` to execute all unit tests across frontend and backend modules.
3. Run `pnpm test:e2e` to execute Playwright browser and desktop overlay test scripts.
4. Run `pnpm test:coverage` to generate Istanbul/V8 code coverage reports.

---

## System Integration
The testing suite validates code quality across all directories (`01_Frontend` through `08_Desktop`), runs automatically inside GitHub Actions CI/CD pipelines in `10_Deployment`, and blocks pull requests if coverage drops below **85%**.
