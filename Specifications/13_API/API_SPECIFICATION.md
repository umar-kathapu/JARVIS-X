# JARVIS-X API Specification

**Document Version:** 1.0.0-draft  
**Last Updated:** 2026-07-23  
**Status:** Active Draft  
**Target System:** JARVIS-X API Gateway & Communication Subsystem  

---

## 1. Purpose
The API Specification defines the unified communication framework of JARVIS-X. It establishes the standards, protocols, data schemas, authentication controls, and error envelopes used for inter-process communication (IPC) between the UI presentation layer, the backend daemon, local memory databases, specialized AI agents, third-party plugins, and external cloud services.

---

## 2. Vision
To establish an enterprise-grade, low-latency API platform that unifies all JARVIS-X capabilities into a clean, developer-friendly interface. Inspired by the seamless communication channels of Iron Man's JARVIS, the API layer enables desktop clients, web overlays, mobile companions, and third-party extensions to interact with the core AI Operating System reliably and securely.

---

## 3. Design Principles
*   **Consistency:** Predictable URI structures, standard HTTP methods, and uniform JSON request/response envelopes across all endpoints.
*   **Simplicity:** Ergonomic payload designs minimizing unnecessary nesting and redundant parameters.
*   **Security by Default:** Mandatory authentication, scope-based authorization, strict payload validation, and transport encryption.
*   **Scalability:** Non-blocking asynchronous event streaming and low-latency IPC channels supporting high request throughput.
*   **Versioning:** Explicit major versioning (`/v1/`) ensuring backwards compatibility as system capabilities evolve.
*   **Reliability:** Strict SLA contracts with standardized error codes, retries, and circuit-breaker protections.
*   **Extensibility:** Dynamic API registration mechanisms allowing plugins to expose new tool endpoints cleanly.
*   **Backward Compatibility:** Deprecation policies ensuring legacy client applications and older plugins continue functioning smoothly.

---

## 4. API Responsibilities
1.  **IPC & Frontend Communication:** Facilitating low-latency local socket communication between UI shells and backend daemons.
2.  **Plugin Gateway Execution:** Exposing sandboxed system interfaces to third-party plugins.
3.  **AI & Model Routing:** Formatting and transmitting prompt payloads to local and cloud LLM endpoints.
4.  **Sensory Streaming:** Handling continuous audio STT and video/screenshot visual streams.
5.  **Authentication & Security Validation:** Verifying authorization tokens, session keys, and permission scopes before request dispatch.
6.  **Telemetry & Monitoring:** Logging request durations, error counts, and API token usage.

---

## 5. High-Level API Architecture

Requests flow through specialized security and validation layers before execution:

```
[ Client (UI Shell / Plugin / External App) ]
                     |
                     v
           [ 1. API Gateway ]
                     |
                     v
      [ 2. Authentication Layer ] ---> (Verifies JWT / Session Tokens / API Keys)
                     |
                     v
       [ 3. Request Validator ] -----> (Validates Payload Schemas via Pydantic/JSON-Schema)
                     |
                     v
      [ 4. Business Service Layer ] -> (Orchestrates Task Execution & AI Planning)
                     |
       +-------------+-------------+-------------+
       |                           |             |
       v                           v             v
[ Memory Engine ]           [ AI Brain ]   [ Tool Sandbox ]
       |                           |             |
       +-------------+-------------+-------------+
                     |
                     v
       [ 5. Response Builder ] -------> (Constructs Standard Response / Error Envelope)
                     |
                     v
[ Client Response (JSON / WebSockets / gRPC) ]
```

---

## 6. API Categories

| Category | Transport / Protocol | Access Scope | Description |
| :--- | :--- | :--- | :--- |
| **Internal APIs** | Local WebSockets / Named Pipes | Internal Subsystems | Core daemon process communication with UI Shell (`127.0.0.1`). |
| **Public APIs** | REST over HTTPS / WebSockets | Authorized External Apps | External desktop apps or companion scripts invoking JARVIS-X. |
| **Plugin APIs** | IPC Gateway Bridge | Sandboxed Plugins | Restricted SDK interfaces exposed to third-party extensions. |
| **AI Router APIs** | HTTPS / REST / gRPC | AI Subsystem | Communication with OpenAI, Claude, Gemini, and Ollama endpoints. |
| **Memory APIs** | Internal Service Methods | Core Backend | Vector database queries and relational memory persistence interfaces. |
| **Automation APIs**| Internal Service Methods | Automation Engine | Trigger registration, Playwright actions, and workflow runners. |
| **Voice / Vision APIs**| Streaming WebSockets / gRPC | Sensory Subsystem | Real-time PCM audio streaming and frame capture ingestion. |
| **Webhook APIs** | HTTP POST Endpoints | Cloud Integration | Receiving external events from GitHub, Jira, or custom webhooks. |

---

## 7. API Standards & Standards Compliance

### 7.1 REST URI Structure & Naming Conventions
*   **Base URL:** `http://127.0.0.1:8443/api/v1`
*   **Resource Naming:** Plural nouns in lower-kebab-case (e.g., `/api/v1/agent-tasks`, `/api/v1/memory-facts`).
*   **Standard Methods:**
    *   `GET`: Retrieve resource or collection.
    *   `POST`: Create new resource or trigger action.
    *   `PUT`: Replace or update existing resource.
    *   `DELETE`: Remove targeted resource.

### 7.2 Standardized Response Envelope
```json
{
  "success": true,
  "correlationId": "req_92a3f4b8c10e",
  "timestamp": "2026-07-23T19:33:07.000Z",
  "data": {
    "taskId": "task_1042",
    "status": "COMPLETED",
    "result": "Build successful."
  },
  "error": null
}
```

### 7.3 Pagination & Sorting Standard
`GET /api/v1/memory-facts?limit=20&page=1&sort_by=-created_at&category=preferences`

---

## 8. Authentication & Authorization
*   **Local IPC Tokens:** UI clients and backend daemons exchange cryptographically generated local session tokens (`x-jarvis-session-token`) during initial handshake.
*   **API Key Management:** External integration clients present bearer keys (`Authorization: Bearer jvx_sk_...`) generated via the settings UI.
*   **Role-Based Access Control (RBAC):** Token claims define explicit permission scopes:
    *   `scope:read` (Read-only status monitoring)
    *   `scope:agent:execute` (Trigger standard agent workflows)
    *   `scope:system:admin` (Full access including elevated terminal actions)

---

## 9. Versioning Strategy & Deprecation
*   **Semantic Versioning:** Major versions (`/v1/`, `/v2/`) indicate breaking API contract changes. Minor/patch releases retain strict backward compatibility.
*   **Deprecation Policy:** When an endpoint is deprecated, responses include a `Sunset` header specifying the retirement date (minimum 6 months warning) and a `Link` header pointing to replacement APIs:
    ```http
    HTTP/1.1 200 OK
    Sunset: Wed, 31 Dec 2026 23:59:59 GMT
    Link: </api/v2/agent-tasks>; rel="successor-version"
    ```

---

## 10. Error Handling & Standard Error Envelopes

All API errors return appropriate HTTP status codes alongside a structured error body:

```json
{
  "success": false,
  "correlationId": "req_92a3f4b8c10e",
  "timestamp": "2026-07-23T19:33:07.000Z",
  "data": null,
  "error": {
    "code": "SECURITY_PERMISSION_DENIED",
    "message": "The requested tool execution requires elevated permission scope 'scope:system:exec'.",
    "details": {
      "missingScope": "scope:system:exec",
      "requestedTool": "terminal_run_command"
    }
  }
}
```

---

## 11. Rate Limiting & Abuse Prevention
*   **Token Bucket Algorithm:** Implemented at the API Gateway to prevent request floods.
*   **Default Limits:**
    *   *Local UI IPC:* Unlimited.
    *   *Public REST Endpoints:* 60 requests/minute (Burst: 100 requests).
    *   *Plugin API Gateway:* 120 requests/minute.
*   **HTTP 429 Handling:** Returns `Retry-After` headers detailing backoff duration when limits are exceeded.

---

## 12. Security Enforcement
*   **Strict Input Validation:** 100% of request bodies are validated against Pydantic models / OpenAPI JSON Schemas.
*   **CORS Policies:** Cross-Origin Resource Sharing restricted strictly to `http://localhost` and `127.0.0.1` origin handles.
*   **Output Sanitization:** Automated regex scrubbers redact sensitive passwords, OAuth secrets, and private keys from response payloads.

---

## 13. Performance Optimization
*   **Response Compression:** Enables Gzip/Brotli payload compression for responses exceeding 1KB.
*   **Streaming WebSockets:** Uses WebSocket channels for real-time AI token streaming and VAD audio updates, avoiding HTTP polling.
*   **Connection Reuse:** Persistent HTTP/2 connection pools for cloud LLM API adapters.

---

## 14. Monitoring, Analytics & Logging
*   **Structured Request Logs:** Logs method, path, response status, duration (ms), caller ID, and correlation ID for every request.
*   **Metrics Telemetry:** Tracks aggregate metrics (`api_request_duration_seconds`, `api_errors_total`) for system health dashboards.

---

## 15. Future Enhancements
*   **GraphQL Support:** Adding an optional GraphQL endpoint for complex context queries against memory graphs.
*   **gRPC IPC Upgrade:** Migrating internal high-volume audio/video streaming buffers from WebSockets to gRPC over HTTP/2 for reduced CPU overhead.

---

## 16. Testing Strategy
*   **Unit Tests:** Validate route handler functions, parameter deserializers, and schema validators.
*   **Integration Tests:** Test end-to-end HTTP/WebSocket API workflows against temporary backend daemons.
*   **Contract Tests:** Automated OpenAPI schema compatibility testing to prevent accidental breaking API changes.
*   **Security Tests:** Automated penetration testing verifying CORS restriction, rate-limiting, and scope enforcement.

---

## 17. Acceptance Criteria
*   [ ] 100% of REST and WebSocket endpoints conform to standardized JSON response and error envelopes.
*   [ ] API Gateway verifies JWT session tokens and scope claims within < 2ms latency.
*   [ ] Schema validation automatically rejects malformed request payloads before hitting business services.
*   [ ] Rate limiter correctly returns HTTP 429 with `Retry-After` headers when request thresholds are breached.
*   [ ] Complete OpenAPI 3.0 specification file (`openapi.json`) is generated automatically from code routes.

---

## 18. Conclusion
The API Specification provides the definitive communication blueprint for JARVIS-X. By establishing consistent URI conventions, standardized response/error envelopes, robust session token security, rate-limiting controls, streaming WebSockets, and clear versioning strategies, the API layer ensures JARVIS-X functions as a scalable, secure, and developer-friendly AI Operating System.
