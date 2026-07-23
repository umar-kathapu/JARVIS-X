# API Development Guide

Welcome to the **JARVIS-X** API Development Guide. JARVIS-X is an enterprise-grade, Iron Man-inspired AI Operating System designed to deliver real-time multi-modal intelligence, voice interface control, computer vision perception, autonomous task execution, and desktop integration.

This document serves as the official, implementation-ready architectural manual for designing, building, documenting, securing, testing, versioning, and maintaining APIs across the JARVIS-X ecosystem.

---

## 1. Purpose

APIs are the primary communication arteries of JARVIS-X. They connect the React frontend, Electron desktop overlay, Fastify backend gateway, Python AI Brain, local vector database, automation queue workers, and sandboxed plugins into a unified, reactive system. The core responsibilities of the API layer include:

- **Service Interoperability**: Providing clean, typed contracts between microservices and desktop desktop shells.
- **Real-Time Data Streaming**: Facilitating 60 FPS system telemetry broadcasts, live microphone WebSockets, and token-by-token LLM streaming.
- **Extensibility**: Exposing safe, permission-scoped plugin APIs to allow developers to extend JARVIS-X with custom skills.
- **Contract Enforcement**: Enforcing strict input validation, response serialization, authentication, and error handling across all client connections.

---

## 2. API Vision

The vision for the JARVIS-X API ecosystem is to establish a secure, contract-driven, ultra-low latency API framework capable of operating seamlessly on local workstations while supporting enterprise multi-tenant deployments.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        JARVIS-X API ECOSYSTEM                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌───────────────────┐    ┌───────────────────┐    ┌────────────────┐  │
│   │ REST API v1       │    │ WEBSOCKET STREAM  │    │ INTERNAL IPC   │  │
│   │ OpenAPI 3.0       │    │ 60 FPS Telemetry  │    │ Electron Main  │  │
│   │ Sub-10ms Gateway  │    │ LLM Token Stream  │    │ Desktop Overlay│  │
│   └─────────┬─────────┘    └─────────┬─────────┘    └───────┬────────┘  │
│             │                        │                      │           │
│             └────────────────────────┼──────────────────────┘           │
│                                      │                                  │
│                   ┌──────────────────▼──────────────────┐               │
│                   │      ZERO-TRUST SECURITY TIER       │               │
│                   │ Argon2id | JWT | RBAC | CORS | Rate │               │
│                   └─────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Tenets

1. **Contract-First Design**: OpenAPI 3.0 schemas defined alongside routes, ensuring auto-generated documentation and zero drift between specification and runtime implementation.
2. **Sub-10ms Gateway Overhead**: Fastify-powered API routing for maximum JSON serialization speed and minimal memory footprint.
3. **Bi-Directional Streaming**: First-class WebSocket support for continuous audio, vision bounding box, and LLM token streams.

---

## 3. API Architecture

JARVIS-X employs a multi-protocol API architecture tailored to specific communication requirements:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          API TIER ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   CLIENT TIERS (React Dashboard / Desktop HUD / External Apps)          │
│         │                                                               │
│         ├───► [ REST API ] ──────► OpenAPI 3.0 / Fastify (Port 8000)    │
│         │                                                               │
│         ├───► [ WEBSOCKET ] ────► ws / @fastify/websocket (Port 8000/ws)│
│         │                                                               │
│         ├───► [ INTERNAL IPC ] ──► Electron IPC Renderer <-> Main Bridge│
│         │                                                               │
│         └───► [ EVENT BUS ] ────► Redis 7.x Pub/Sub & BullMQ Queues      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                             API TECH STACK                              │
├───────────────┬──────────────────────────┬──────────────────────────────┤
│ Component     │ Technology               │ Purpose & Role               │
├───────────────┼──────────────────────────┼──────────────────────────────┤
│ Gateway Core  │ Fastify (Node.js 22 LTS) │ Primary high-throughput server│
│ Specification │ OpenAPI 3.0 / Swagger UI │ Auto-generated API docs      │
│ Real-Time     │ @fastify/websocket (ws)  │ WebSocket bi-directional stream│
│ Validation    │ Ajv / Zod                │ Fast JSON schema validation  │
│ Auth          │ JWT & Argon2id           │ Access/Refresh token security│
│ Cache & Rate  │ Redis 7.x                │ Sliding-window rate limiter  │
└───────────────┴──────────────────────────┴──────────────────────────────┘
```

---

## 5. API Design Standards

### 5.1 REST Resource Naming & URI Design

All REST endpoints follow standard RESTful conventions:

- Use **plural nouns** for resource paths (`/api/v1/conversations`, `/api/v1/plugins`).
- Use **kebab-case** for multi-word paths (`/api/v1/system-telemetry`).
- Keep URIs lowercase without trailing slashes.

| HTTP Method | Resource URI | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/v1/conversations` | Retrieve paginated list of conversations |
| `POST` | `/api/v1/conversations` | Create a new conversation session |
| `GET` | `/api/v1/conversations/:id` | Retrieve specific conversation by ID |
| `PATCH` | `/api/v1/conversations/:id` | Partially update conversation title/metadata |
| `DELETE` | `/api/v1/conversations/:id` | Soft-delete a conversation session |

---

### 5.2 Standardized JSON Response Envelopes

#### Success Envelope Example (`200 OK` / `201 Created`):
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "conv-94a21-8f3b",
    "title": "Voice Assistant Debug Session",
    "messageCount": 12
  },
  "meta": {
    "timestamp": "2026-07-23T19:48:57.000Z",
    "requestId": "req-88b12-9c4d"
  }
}
```

---

### 5.3 Pagination, Filtering, and Sorting

Paginated endpoints must return standard pagination metadata:

$$\text{Request: } \texttt{GET /api/v1/messages?page=2\&limit=10\&sort=createdAt:desc}$$

```json
{
  "success": true,
  "statusCode": 200,
  "data": [ /* Array of 10 Message objects */ ],
  "meta": {
    "pagination": {
      "totalItems": 45,
      "totalPages": 5,
      "currentPage": 2,
      "limit": 10,
      "hasNextPage": true,
      "hasPrevPage": true
    },
    "timestamp": "2026-07-23T19:48:57.000Z",
    "requestId": "req-12a34-5b6c"
  }
}
```

---

## 6. Authentication & Authorization

JARVIS-X uses a dual-token JWT authentication strategy backed by Role-Based Access Control (RBAC):

- **Access Token**: Short-lived (15 minutes) Bearer token sent in `Authorization` header.
- **Refresh Token**: Long-lived (7 days) token stored in `HttpOnly`, `SameSite=Strict`, `Secure` cookie.
- **API Keys**: External client applications and plugin extensions use hashed API keys prefixed with `jvx_live_...` sent via `X-API-Key` header.

```
Header Format: Authorization: Bearer <access_token>
Header Format: X-API-Key: jvx_live_948f2a17b83c...
```

---

## 7. API Versioning

API versions are specified directly in the URI path (`/api/v1/`).

### Deprecation & Breaking Change Policy

When introducing breaking changes that require a new API version (e.g., `/api/v2/`):

1. **Deprecation Notice**: Announce deprecation via response HTTP headers:
   ```http
   Deprecation: true
   Sunset: Wed, 11 Nov 2026 00:00:00 GMT
   Link: <https://docs.jarvis-x.io/api/v2-migration>; rel="successor-version"
   ```
2. **Grace Period**: Support older API versions for a minimum of **6 months** prior to sunsetting.

---

## 8. Error Handling

Errors follow the **RFC 7807 Problem Details** standard format:

```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload attributes.",
    "details": [
      {
        "field": "email",
        "issue": "Must be a valid email address format."
      }
    ]
  },
  "meta": {
    "timestamp": "2026-07-23T19:48:57.000Z",
    "requestId": "req-99c88-7a6b"
  }
}
```

---

## 9. AI API Integration

AI endpoints provide streaming and synchronous capabilities:

- `POST /api/v1/ai/completions`: Non-streaming prompt completion.
- `GET /api/v1/ai/stream`: SSE token stream (`text/event-stream`).
- `WS /ws/ai-stream`: Bi-directional WebSocket stream for real-time speech-to-text token exchange.
- `GET /api/v1/ai/models`: List available local and cloud LLM models.

---

## 10. Plugin APIs

Plugins interact with JARVIS-X via dedicated, sandboxed plugin management APIs:

- `POST /api/v1/plugins/register`: Register a new plugin package.
- `GET /api/v1/plugins`: List active plugins and permission scopes.
- `POST /api/v1/plugins/:id/execute`: Execute a plugin skill with sandboxed parameters.

---

## 11. Automation APIs

- `POST /api/v1/automation/schedules`: Create a cron-scheduled workflow task.
- `POST /api/v1/automation/workflows/execute`: Trigger instant workflow execution.
- `GET /api/v1/automation/jobs/:id`: Fetch background job status and logs.

---

## 12. API Security

- **HTTPS / TLS 1.3**: All external traffic strictly encrypted over TLS 1.3.
- **Rate Limiting**: Configured via `@fastify/rate-limit` using Redis sliding window (default: 100 req/min per IP; 10 req/min for `/auth/login`).
- **CORS Policy**: Restricted strictly to authorized frontend origins (`http://localhost:3000`, `app://jarvis-desktop`).
- **Security Headers**: Managed via `@fastify/helmet` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).

---

## 13. API Documentation

JARVIS-X uses `@fastify/swagger` and `@fastify/swagger-ui` to auto-generate interactive OpenAPI 3.0 documentation:

- **Swagger UI Interactive Explorer**: Accessible locally at `http://localhost:8000/documentation`.
- **OpenAPI Spec JSON**: Exported at `http://localhost:8000/documentation/json`.

---

## 14. API Testing

| Test Layer | Tool | Scope | Execution Command |
| :--- | :--- | :--- | :--- |
| **Unit Tests** | Vitest | Controllers & validation logic | `pnpm run test:unit` |
| **Integration Tests**| Supertest + Fastify | Endpoint HTTP requests & DB state | `pnpm run test:integration` |
| **Contract Tests** | OpenAPI Validator | Verify responses match OpenAPI spec | `pnpm run test:contract` |
| **Load Tests** | k6 | WebSocket & REST concurrency performance | `pnpm run test:load` |

---

## 15. Monitoring & Observability

- **Metrics**: Expose Prometheus metrics at `GET /metrics` (HTTP request rates, latency histograms, active WebSockets).
- **Health Check Endpoints**:
  - `GET /health/live`: Basic Fastify server liveness (`200 OK`).
  - `GET /health/ready`: Deep health check verifying PostgreSQL, Redis, and Vector DB connectivity.

---

## 16. Best Practices

1. **Zero Unhandled Rejections**: Always wrap async route handlers in try/catch or let Fastify's default error handler intercept errors cleanly.
2. **Never Expose Internal Stack Traces**: Suppress raw internal error stack traces in production responses.
3. **Log Correlation IDs**: Pass `x-request-id` headers through all microservice and database logs for end-to-end request tracing.

---

## 17. Acceptance Criteria

The API layer is production-ready when:

- [ ] **OpenAPI Spec Complete**: 100% of REST and WebSocket endpoints fully documented in Swagger UI (`/documentation`).
- [ ] **Validation Passing**: All route inputs strictly validated using Zod / Ajv schemas.
- [ ] **Rate Limiting Active**: Redis rate limiting verified working on all public routes.
- [ ] **Integration Tests**: API test suite achieves minimum **85% code coverage**.
- [ ] **Latency Target**: Baseline REST endpoint routing latency is under **10ms**.

---

## 18. Conclusion

Following this API Development Guide ensures that the JARVIS-X API ecosystem remains fast, secure, well-documented, and modular. By standardizing Fastify route definitions, OpenAPI specifications, JWT authentication, and WebSocket streaming protocols, developers can build a world-class communication foundation for the AI Operating System.
