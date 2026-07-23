# Backend Development Guide

Welcome to the **JARVIS-X** Backend Development Guide. JARVIS-X is an enterprise-grade, Iron Man-inspired AI Operating System designed to deliver real-time multi-modal intelligence, voice interface control, computer vision perception, autonomous task execution, and desktop integration.

This document serves as the official, implementation-ready architectural reference and coding standard for designing, developing, scaling, and maintaining the backend service ecosystem of JARVIS-X.

---

## 1. Purpose

The backend layer of JARVIS-X acts as the core central nerve system of the AI Operating System. Its primary responsibilities within the multi-service architecture include:

- **API Gateway & Routing**: Exposing secure, low-latency REST and WebSocket endpoints for frontend UI dashboards, native desktop overlays, and external client applications.
- **AI & Model Orchestration**: Managing local LLM inference engines (Ollama/vLLM), cloud LLM providers (OpenAI/Anthropic), prompt pipelines, and real-time token streaming.
- **Memory & Vector Knowledge Retrieval**: Interfacing with vector databases (Qdrant/Milvus/pgvector) to perform RAG (Retrieval-Augmented Generation) and manage conversation context windows.
- **Automation & Job Execution**: Scheduling cron workflows, managing background event queues (BullMQ/Redis), and processing long-running async tasks.
- **Plugin Sandbox Communication**: Providing an IPC/RPC bridge to execute third-party skills and plugins safely within sandboxed runtime environments.
- **Persistence & State Management**: Managing relational data storage (PostgreSQL), high-speed in-memory caches (Redis), and database migrations via Prisma ORM.

---

## 2. Backend Vision

The backend architecture for JARVIS-X is designed with a long-term vision of high-throughput, sub-10ms routing latency, event-driven reactivity, and modular decoupling.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        BACKEND CORE VISION                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌───────────────────┐    ┌───────────────────┐    ┌────────────────┐  │
│   │ HIGH THROUGHPUT   │    │  EVENT DRIVEN     │    │ AI MULTI-MODEL │  │
│   │ Fastify & Node.js │    │  Redis Pub/Sub &  │    │  Orchestration │  │
│   │ Sub-10ms Routing  │    │  BullMQ Queue     │    │ & Local Engine │  │
│   └─────────┬─────────┘    └─────────┬─────────┘    └───────┬────────┘  │
│             │                        │                      │           │
│             └────────────────────────┼──────────────────────┘           │
│                                      │                                  │
│                   ┌──────────────────▼──────────────────┐               │
│                   │    ENTERPRISE-GRADE SECURITY        │               │
│                   │  Argon2id | JWT | RBAC | Sandboxing │               │
│                   └─────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Pillars

1. **High Concurrency & Low Overhead**: Asynchronous I/O designed to support continuous 60 FPS visual telemetry streams and real-time audio WebSockets without thread blocking.
2. **Modular Tier Decoupled Architecture**: Strict separation between API controllers, service handlers, repository accessors, and external AI connectors.
3. **Resilient Local-First Execution**: Built to operate seamlessly offline with local LLMs and local vector storage, falling back gracefully to cloud APIs when required.
4. **Strict Security & Sandboxing**: Enterprise-grade authentication (JWT/Argon2id), Role-Based Access Control (RBAC), and strict sandboxing for plugin execution.

---

## 3. Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BACKEND TECH STACK                            │
├─────────────┬──────────────────────────┬────────────────────────────────┤
│ Layer       │ Technology               │ Version & Primary Role         │
├─────────────┼──────────────────────────┼────────────────────────────────┤
│ Runtime     │ Node.js                  │ v20.x / v22.x LTS (Async I/O)  │
│ Language    │ TypeScript               │ v5.x (Strict Type Safety)      │
│ Framework   │ Fastify                  │ v4.x / v5.x (Primary API Core) │
│ REST Spec   │ OpenAPI 3.0 / Swagger    │ Specification & Auto Docs      │
│ WebSockets  │ @fastify/websocket (ws)  │ Real-time Bi-directional Stream│
│ Container   │ Docker & Docker Compose  │ Containerized Microservices    │
│ Cache / Bus │ Redis                    │ v7.x (Cache, Pub/Sub, Queue)   │
│ Database    │ PostgreSQL               │ v16.x (Relational Storage)     │
│ ORM         │ Prisma ORM               │ v5.x (Type-Safe Data Layer)    │
│ Job Queue   │ BullMQ                   │ v5.x (Async Background Jobs)   │
└─────────────┴──────────────────────────┴────────────────────────────────┘
```

---

### Framework Evaluation: Fastify vs. Express.js

JARVIS-X explicitly evaluates and selects **Fastify** as its primary API framework over Express.js:

| Capability / Metric | Express.js | Fastify (Selected) | Advantage for JARVIS-X |
| :--- | :--- | :--- | :--- |
| **HTTP Throughput** | ~15,000 req/sec | **~75,000 req/sec** | 5x higher throughput for real-time telemetry APIs. |
| **Schema Validation** | Manual / Third-party middleware | **Built-in Ajv JSON Schema** | Instant request serialization & validation at routing layer. |
| **TypeScript Support** | Requires `@types/express` | **First-class native TS support** | Full inferrence for route parameters, body, and query schemas. |
| **Plugin Ecosystem** | Middleware-based | **Encapsulated Plugin Architecture** | Clean, modular dependency injection and scope isolation. |
| **Async Overhead** | Higher memory footprint | **Low memory allocation** | Essential for running alongside local AI models on desktop devices. |

> **Decision**: **Fastify** is the standard framework for all core API microservices. Express compatibility layers are retained strictly for legacy third-party middleware if required.

---

## 4. Backend Architecture

The backend follows a layered, decoupled architecture ensuring clean boundaries between data transport, business logic, persistence, and AI orchestration.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYERED ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ 1. API & ROUTING LAYER (Fastify Routes / Controllers / WebSockets)│  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                    │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │ 2. MIDDLEWARE LAYER (Auth JWT, RBAC, Rate Limit, Error Handler)   │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                    │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │ 3. SERVICE & BUSINESS LOGIC LAYER (System Services & Workflows)   │  │
│  └──────┬──────────────────────────┬──────────────────────────┬──────┘  │
│         │                          │                          │         │
│  ┌──────▼───────────────┐   ┌──────▼───────────────┐   ┌──────▼──────┐  │
│  │ 4. AI ORCHESTRATOR   │   │ 5. MEMORY ENGINE     │   │ 6. AUTOMATION│  │
│  │ (LLM Engine Router)  │   │ (Vector RAG Search)  │   │ (BullMQ/Cron)│  │
│  └──────┬───────────────┘   └──────┬───────────────┘   └──────┬──────┘  │
│         │                          │                          │         │
│  ┌──────▼──────────────────────────▼──────────────────────────▼──────┐  │
│  │ 7. DATA ACCESS & REPOSITORY LAYER (Prisma ORM / Redis Client)     │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
│                                    │                                    │
│  ┌─────────────────────────────────▼─────────────────────────────────┐  │
│  │ 8. INFRASTRUCTURE & STORAGE (PostgreSQL / Redis / Qdrant)         │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Project Structure

The backend source code in `Development/02_Backend/` is structured as follows:

```
Development/02_Backend/
├── src/
│   ├── app.ts                  # Fastify application bootstrap & plugin registration
│   ├── server.ts               # HTTP & WebSocket server launcher (port listener)
│   ├── routes/                 # API Routes declaration & schema definitions
│   │   ├── v1/                 # API Version 1 endpoints
│   │   │   ├── system.routes.ts# System status, health, resource telemetry routes
│   │   │   ├── ai.routes.ts    # Prompt execution & model status routes
│   │   │   ├── memory.routes.ts# Vector RAG search & document vault routes
│   │   │   ├── auth.routes.ts  # JWT login, refresh, user profile routes
│   │   │   └── plugin.routes.ts# Plugin registry & skill execution routes
│   │   └── websocket/          # WebSocket streaming route definitions
│   │       ├── telemetry.ws.ts # 60 FPS system telemetry WebSocket handler
│   │       └── ai-stream.ws.ts # Real-time LLM token streaming handler
│   ├── controllers/            # HTTP Request controllers (parsing & payload handling)
│   │   ├── system.controller.ts
│   │   ├── ai.controller.ts
│   │   └── auth.controller.ts
│   ├── services/               # Core Domain Service business logic
│   │   ├── system.service.ts   # OS metrics collection & process controls
│   │   ├── auth.service.ts     # Password hashing, JWT token issue/verify
│   │   └── plugin.service.ts   # Sandboxed plugin execution service
│   ├── middleware/             # Fastify Hooks & Custom Middleware
│   │   ├── auth.middleware.ts  # JWT verification hook
│   │   ├── rbac.middleware.ts  # Role authorization hook
│   │   ├── error.middleware.ts # Global error handler & RFC 7807 formatter
│   │   └── rate-limit.ts       # Sliding window rate limiter
│   ├── ai/                     # AI Orchestrator & Provider Abstractions
│   │   ├── orchestrator.ts     # LLM router & provider selection logic
│   │   ├── prompt-builder.ts   # System prompt composition engine
│   │   ├── providers/          # Model provider adapters
│   │   │   ├── ollama.provider.ts
│   │   │   ├── openai.provider.ts
│   │   │   └── anthropic.provider.ts
│   │   └── streaming/          # SSE & WebSocket streaming chunk formatters
│   ├── memory/                 # Vector Memory & RAG Retrieval
│   │   ├── vector-store.ts     # Qdrant / Milvus / pgvector client wrapper
│   │   └── rag-engine.ts       # Context embedding search & prompt injector
│   ├── automation/             # Job Queues & Cron Task Management
│   │   ├── queue.manager.ts    # BullMQ connection & queue initializer
│   │   ├── scheduler.ts        # Cron job scheduler definitions
│   │   └── workers/            # BullMQ background job workers
│   │       ├── embedding.worker.ts
│   │       └── telemetry.worker.ts
│   ├── plugins/                # Plugin Management & IPC Hooks
│   │   ├── plugin-runner.ts    # Node.js `child_process` / `worker_threads` sandbox
│   │   └── permissions.ts      # Skill permission checker
│   ├── repositories/           # Prisma Data Access Repositories
│   │   ├── user.repository.ts  # User account queries
│   │   └── audit.repository.ts # System event log persistence
│   ├── database/               # Database Connection & Migration Schemas
│   │   ├── schema.prisma       # Master Prisma database schema definition
│   │   ├── client.ts           # PrismaClient singleton instance
│   │   └── migrations/         # Prisma SQL migration history
│   ├── models/                 # TypeScript DTOs & Validation Schemas
│   │   ├── dto/                # Request / Response Data Transfer Objects
│   │   └── schemas/            # Zod & Ajv JSON schemas
│   ├── config/                 # Environment Variables & Configuration
│   │   ├── env.config.ts       # Zod-validated environment config object
│   │   └── constants.ts        # System constants & HTTP status codes
│   └── utils/                  # Pure Utility Functions
│       ├── logger.ts           # Pino structured JSON logger singleton
│       ├── crypto.ts           # Argon2id hashing & AES encryption helpers
│       └── response-formatter.ts
├── logs/                       # Application JSON log files directory
├── tests/                      # Automated Test Suites
│   ├── unit/                   # Vitest unit test cases
│   ├── integration/            # API & DB integration tests
│   └── load/                   # k6 WebSocket load scripts
├── Dockerfile                  # Production container build file
└── tsconfig.json               # TypeScript compiler configuration
```

---

## 6. API Design

### 6.1 REST Principles & Route Versioning

All HTTP endpoints strictly follow RESTful design standards and must be versioned under the `/api/v1/` path prefix:

- `GET /api/v1/system/status` - Retrieve current system health and resource telemetry.
- `POST /api/v1/ai/completion` - Submit prompt for AI completion.
- `GET /api/v1/memory/documents` - List RAG memory documents (supports pagination & search).
- `POST /api/v1/auth/login` - Authenticate user credentials and receive JWT tokens.

---

### 6.2 Standardized JSON Response Envelope

All API endpoints must return a predictable, standardized JSON envelope:

#### Success Response Example:
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "systemState": "ONLINE",
    "activeServices": ["backend", "ai-engine", "qdrant"]
  },
  "meta": {
    "timestamp": "2026-07-23T19:47:30.000Z",
    "requestId": "req-94a21-8f3b"
  }
}
```

#### Error Response Example (RFC 7807 Problem Details):
```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "INVALID_INPUT_SCHEMA",
    "message": "The request body failed validation constraints.",
    "details": [
      {
        "field": "prompt",
        "issue": "String must contain at least 1 character(s)"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-07-23T19:47:30.000Z",
    "requestId": "req-94a21-8f3b"
  }
}
```

---

### 6.3 Pagination & Filtering Standards

List endpoints must accept standard query parameters for pagination:

$$\text{Query Parameters: } \texttt{?page=1\&limit=20\&sort=createdAt:desc\&search=term}$$

```typescript
export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
```

---

## 7. Authentication & Authorization

JARVIS-X employs a dual-token JWT authentication architecture backed by **Argon2id** password hashing.

```
┌────────────────────────┐                   ┌────────────────────────┐
│      CLIENT APP        │                   │     BACKEND SERVER     │
└───────────┬────────────┘                   └───────────┬────────────┘
            │                                            │
            │  1. POST /api/v1/auth/login (Credentials)  │
            ├───────────────────────────────────────────►│
            │                                            │ (Verify Argon2id hash)
            │  2. Returns: AccessToken (15m JWT) +       │ (Set HttpOnly Refresh Cookie)
            │              RefreshToken Cookie           │
            │◄───────────────────────────────────────────┤
            │                                            │
            │  3. GET /api/v1/ai/completion              │
            │     Header: Authorization: Bearer <JWT>    │
            ├───────────────────────────────────────────►│
            │                                            │ (Validate JWT & RBAC)
            │  4. Protected Data / AI Stream Response    │
            │◄───────────────────────────────────────────┤
```

### 7.1 Security Architecture Specifications

- **Password Hashing**: **Argon2id** (`memoryCost: 65536`, `timeCost: 3`, `parallelism: 4`).
- **Access Tokens**: Short-lived JWTs (15-minute expiration) signed via RS256 private key.
- **Refresh Tokens**: Long-lived tokens (7 days) stored in `HttpOnly`, `SameSite=Strict`, `Secure` cookies and tracked inside Redis revocation lists.
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: Full administrative control, API key generation, system shutdown privileges.
  - `DEVELOPER`: Plugin installation, workflow editing, model fine-tuning.
  - `OPERATOR`: Standard voice/vision execution, chat prompts, RAG document upload.
  - `GUEST`: Read-only system status inspection.

---

## 8. Database Integration

JARVIS-X uses **PostgreSQL** as its primary relational database managed via **Prisma ORM**.

### 8.1 Prisma Schema Sample (`src/database/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  DEVELOPER
  OPERATOR
  GUEST
}

model User {
  id           String     @id @default(uuid())
  email        String     @unique
  passwordHash String
  name         String
  role         Role       @default(OPERATOR)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  auditLogs    AuditLog[]

  @@map("users")
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  action    String
  resource  String
  ipAddress String
  metadata  Json?
  createdAt DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("audit_logs")
}
```

---

### 8.2 Database Migration Workflow

```bash
# Generate Prisma Client types after schema update
pnpm exec prisma generate

# Create and apply local development database migration
pnpm exec prisma migrate dev --name init_schema

# Apply pending migrations on production/staging deployment
pnpm exec prisma migrate deploy
```

---

## 9. AI Integration & Orchestration

The `AI Orchestrator` (`src/ai/orchestrator.ts`) provides a unified, provider-agnostic interface for executing prompts across local and cloud LLMs.

```
                                  ┌───────────────────────────┐
                                  │   PROMPT REQUEST ENTER    │
                                  └─────────────┬─────────────┘
                                                │
                                  ┌─────────────▼─────────────┐
                                  │   AI MODEL ORCHESTRATOR   │
                                  └─────────────┬─────────────┘
                                                │
                                  ┌─────────────▼─────────────┐
                                  │  IS LOCAL OLLAMA ONLINE?  │
                                  └──────┬──────────────┬─────┘
                                     YES │              │ NO / TIMEOUT
                                         │              │
                   ┌─────────────────────▼──┐        ┌──▼────────────────────┐
                   │  EXECUTE LOCAL OLLAMA  │        │  FALLBACK CLOUD LLM   │
                   │  (Llama-3 8B / Q8_0)   │        │  (OpenAI / Anthropic) │
                   └────────────────────────┘        └───────────────────────┘
```

### Fallback & Resilience Strategy

1. **Primary Target**: Local Ollama / vLLM engine (`http://localhost:11434`). Fast, zero cloud cost, local privacy.
2. **Circuit Breaker**: If local LLM latency exceeds **5000ms** or returns connection errors, the orchestrator automatically trips the circuit breaker and redirects the prompt to cloud fallback endpoints (OpenAI GPT-4o / Anthropic Claude 3.5 Sonnet).
3. **Streaming Protocol**: All responses support Server-Sent Events (SSE) or WebSockets to stream tokens incrementally to the frontend visualizer.

---

## 10. Plugin & Automation Integration

### 10.1 Background Job Queue with BullMQ

Long-running tasks (such as embedding processing, document vectorization, and cron telemetry backups) are offloaded to **BullMQ** worker processes:

```typescript
// src/automation/queue.manager.ts
import { Queue, Worker } from 'bullmq';
import { redisConnection } from '../config/redis.config';

export const embeddingQueue = new Queue('embedding-tasks', {
  connection: redisConnection,
});

// Worker Process Definition
export const embeddingWorker = new Worker(
  'embedding-tasks',
  async (job) => {
    console.log(`[Job ${job.id}] Vectorizing document chunk: ${job.data.documentId}`);
    // Perform vector embedding computation...
  },
  { connection: redisConnection }
);
```

---

## 11. Performance Optimization

1. **Multi-Tier Caching**:
   - **L1 In-Memory Cache**: Node.js LRU cache for high-frequency settings lookups (<1ms).
   - **L2 Redis Cache**: Shared Redis cache for system telemetry and token session state (<2ms).
2. **Asynchronous Non-Blocking Processing**: Heavy background computations are offloaded to BullMQ worker threads.
3. **Gzip / Brotli Compression**: Fastify responses are automatically compressed using `@fastify/compress`.
4. **Sliding Window Rate Limiting**: Managed via `@fastify/rate-limit` using Redis counters (e.g., 100 requests per minute per IP).

---

## 12. Logging & Monitoring

JARVIS-X uses **Pino** for structured JSON logging with correlation IDs:

```typescript
// src/utils/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Usage Example:
// logger.info({ event: 'ai_completion_success', provider: 'ollama', latencyMs: 340 });
```

### Health Check Endpoints

- `GET /health/live`: Liveness check (returns `200 OK` if Fastify server is running).
- `GET /health/ready`: Readiness check (verifies active connections to PostgreSQL, Redis, and Vector DB).

---

## 13. Backend Testing

Testing is mandatory for all backend services before merging code:

| Testing Tier | Framework | Scope | Execution Command |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | Vitest | Services, utility functions, prompt builders | `pnpm run test:unit` |
| **Integration Tests** | Vitest + Supertest | API routes, Prisma DB repositories | `pnpm run test:integration` |
| **Load Testing** | k6 | WebSocket latency & REST concurrency benchmarks | `pnpm run test:load` |

---

## 14. Coding Standards

- **Naming Conventions**:
  - Class Names: PascalCase (`AIOrchestrator`, `UserRepository`).
  - Method / Function Names: camelCase (`processStreamPayload`, `getUserById`).
  - Constants: `UPPER_SNAKE_CASE` (`DEFAULT_TIMEOUT_MS`).
- **Error Handling**: Throw custom typed exceptions (`AppError`, `UnauthorizedError`, `ValidationError`) caught by the global Fastify error handler.
- **Strict Typing**: No explicit `any`. Define Zod schemas or TypeScript interfaces for all inputs and returns.

---

## 15. Best Practices

1. **Graceful Shutdown**: Intercept `SIGTERM` and `SIGINT` signals to close database pools, flush Redis queues, and notify connected WebSocket clients cleanly before exiting.
2. **Defensive DB Queries**: Always specify select fields in Prisma queries to prevent pulling unneeded heavy columns or sensitive fields (such as `passwordHash`).
3. **Fail-Safe AI Execution**: Set tight timeout bounds on all external LLM calls to prevent socket starvation.

---

## 16. Acceptance Criteria

Backend service development is complete when:

- [ ] **Type Safety**: `pnpm run typecheck` passes with zero errors under strict TypeScript settings.
- [ ] **Routing Benchmarks**: Fastify server handles **>50,000 req/sec** in local synthetic benchmarks.
- [ ] **Security Checks**: JWT authentication, RBAC hooks, and Argon2id password hashing verified via integration tests.
- [ ] **Database Verification**: All Prisma migrations execute cleanly and seed scripts run without error.
- [ ] **AI Orchestration**: Local Ollama execution succeeds with automatic cloud fallback working on simulated timeout.
- [ ] **Test Coverage**: Unit and integration test suites achieve minimum **85% code coverage**.

---

## 17. Conclusion

Following this Backend Development Guide ensures that the JARVIS-X backend engine remains ultra-fast, secure, modular, and resilient. By standardizing Fastify route handlers, Prisma database interactions, BullMQ job queues, and AI provider orchestrations, backend engineers can confidently build out the intelligence backbone of JARVIS-X.
