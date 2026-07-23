# 02_Backend

## Purpose
The `02_Backend` folder contains the core API gateway and server microservices for JARVIS-X. Powered by Fastify, Node.js 22 LTS, and TypeScript, it handles high-throughput HTTP routing, bi-directional WebSocket streaming, authentication, session validation, and microservice orchestration.

---

## Responsibilities
- **API Routing Gateway**: Exposing RESTful endpoints (`/api/v1/`) and WebSocket connections (`/ws/telemetry`).
- **High-Throughput Performance**: Achieving >50,000 req/sec routing throughput with low memory overhead.
- **Security & Authentication**: Managing Argon2id password hashing, JWT Access/Refresh tokens, and Role-Based Access Control (RBAC).
- **Request Validation**: Validating incoming HTTP requests using JSON Schema and Ajv.
- **Service Orchestration**: Coordinating data flow between AI Brain engines, vector memory stores, database repositories, and background job queues.

---

## Files Created in this Folder
- `src/server.ts`: HTTP & WebSocket server launcher.
- `src/routes/`: Versioned API route declarations (`system.routes.ts`, `ai.routes.ts`, `auth.routes.ts`).
- `src/controllers/`: HTTP request controllers handling request parameters and response serialization.
- `src/services/`: Core domain business logic services (`system.service.ts`, `auth.service.ts`).
- `src/middleware/`: Fastify security hooks (JWT auth, RBAC authorization, rate limiting).
- `src/repositories/`: Prisma database query accessors.
- `src/utils/`: Pino structured JSON logger and cryptography utilities.

---

## Development Workflow
1. Navigate to `Implementation/02_Backend/`.
2. Ensure PostgreSQL and Redis containers are running via Docker.
3. Run `pnpm dev` to launch the Fastify server with auto-reload at `http://localhost:8000`.
4. Run `pnpm run test:integration` to execute API integration tests against ephemeral test containers.

---

## System Integration
The backend serves as the central API bridge for `01_Frontend` and `08_Desktop`, routes prompt requests to `04_AI`, queries relational data and vector indexes from `03_Database`, dispatches async background jobs to `07_Automation`, and enforces contracts defined in `05_APIs`.
