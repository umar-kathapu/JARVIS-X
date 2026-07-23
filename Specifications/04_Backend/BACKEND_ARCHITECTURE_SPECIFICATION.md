# JARVIS-X Backend Architecture Specification

**Document Version:** 1.0.0-draft  
**Last Updated:** 2026-07-23  
**Status:** Active Draft  
**Target System:** JARVIS-X Core Daemon & Subsystem Engine  

---

## 1. Purpose
The backend of JARVIS-X functions as the core operating engine of the AI Operating System. Operating as a persistent background daemon, the backend is responsible for orchestrating task execution, processing sensory streams (voice and screen vision), managing vector and relational memory, executing sandboxed tools, running plugin runtimes, and maintaining communication with the client presentation shell via local IPC/WebSockets.

By establishing strict architectural boundaries, the backend guarantees high throughput, low-latency execution, zero resource leakage, and absolute system security.

---

## 2. Design Philosophy
The backend architecture adheres to seven core software engineering principles:

*   **Modular Architecture:** Components are encapsulated into decoupled services with distinct domain responsibilities.
*   **Scalability:** Services scale horizontally via asynchronous event loops and worker pools without blocking core event cycles.
*   **Maintainability:** Strong separation of concerns ensures changes in database providers, model routers, or platform adapters do not cascade into business logic.
*   **Extensibility:** Features and integrations are exposed via clean plugin interfaces and dependency injection containers.
*   **Event-Driven Design:** Asynchronous, non-blocking pub/sub message loops decouple input ingestion from task execution.
*   **Dependency Injection (DI):** Service dependencies are explicitly injected via container frameworks to facilitate automated testing and mocking.
*   **SOLID Principles:** Enforces Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion across all backend modules.

---

## 3. Overall Backend Architecture

The backend is organized into eight distinct structural layers:

```
+-----------------------------------------------------------------------------------+
| 1. API LAYER (IPC Server, WebSockets, REST Endpoints, Input Validation)          |
+-----------------------------------------------------------------------------------+
                                      |
+-----------------------------------------------------------------------------------+
| 2. SERVICE LAYER (Business Logic, Workflow Coordinators, Task Orchestrators)       |
+-----------------------------------------------------------------------------------+
         |                             |                            |
+------------------+         +------------------+         +------------------+
| 3. DOMAIN LAYER  |         | 7. AI LAYER      |         | 8. MEMORY LAYER  |
| (Entities, Value |         | (Model Router,   |         | (Vector Search,  |
|  Objects, Rules) |         |  Prompt Engines) |         |  Session Cache)  |
+------------------+         +------------------+         +------------------+
         |                             |                            |
+-----------------------------------------------------------------------------------+
| 4. REPOSITORY LAYER (Data Access Interfaces, Database Mappers)                   |
+-----------------------------------------------------------------------------------+
         |                                                          |
+------------------------------------+    +-----------------------------------------+
| 5. INFRASTRUCTURE LAYER            |    | 6. PLUGIN LAYER                         |
| (OS Drivers, File Sandbox, Process |    | (Plugin Discovery, WASM/Virtual env     |
|  Runners, Hardware Monitors)       |    |  Sandboxes, Extension Hooks)            |
+------------------------------------+    +-----------------------------------------+
```

### Layer Responsibilities
1.  **API Layer:** Handles request deserialization, payload validation, protocol translation (WebSocket/gRPC/IPC), and forwards structural DTOs (Data Transfer Objects) to the Service Layer.
2.  **Service Layer:** Implements business workflows, task scheduling, agent execution loops, and coordination between memory, AI models, and infrastructure tools.
3.  **Domain Layer:** Contains core business entities, status enums, domain events, and pure validation rules. Has zero external dependencies.
4.  **Repository Layer:** Abstracts data access for SQLite and local vector databases, providing clean collection-like interfaces to the Service Layer.
5.  **Infrastructure Layer:** Wraps low-level operating system APIs (Win32, COM, AppleScript, DBus), process execution sandboxes, and file watchers.
6.  **Plugin Layer:** Manages third-party plugin discovery, loading, capability registration, permission enforcement, and isolated runtime execution.
7.  **AI Layer:** Manages prompt assembly, local/cloud model routing, structural output validation, and streaming token parsers.
8.  **Memory Layer:** Handles real-time session caching, long-term vector embeddings, cosine similarity search, and context window pruning.

---

## 4. Folder Structure

```
/backend
├── /src
│   ├── /api                      # API Handlers, IPC Controller, DTOs, Schemas
│   │   ├── /ipc                  # WebSocket & IPC socket servers
│   │   ├── /rest                 # Internal REST HTTP endpoints
│   │   └── /dto                  # Request/Response Data Transfer Objects
│   ├── /core                     # Core Framework (Event Bus, DI Container, Config)
│   │   ├── /bus                  # Central Event Bus implementation
│   │   ├── /di                   # Dependency Injection bindings
│   │   └── /config               # Environment and settings providers
│   ├── /domain                   # Domain Entities, Value Objects, Domain Events
│   │   ├── /entities             # Task, Session, Plugin, UserPreference
│   │   └── /enums                # TaskStatus, SecurityLevel, ActionType
│   ├── /services                 # Business Logic & Workflow Orchestrators
│   │   ├── /agent                # Planning loops & execution checkers
│   │   ├── /sensory              # Audio STT & Screen vision pipelines
│   │   └── /automation           # OS Task coordination services
│   ├── /ai                       # Model Routers, Clients, Prompt Templates
│   │   ├── /routers              # Hybrid Local/Cloud model dispatchers
│   │   └── /prompts              # System prompt definitions & context formatters
│   ├── /memory                   # Memory Subsystem Adapters
│   │   ├── /vector               # ChromaDB / Qdrant vector store drivers
│   │   └── /cache                # Transient in-memory session caches
│   ├── /repository               # Data Repositories & Database Schemas
│   │   ├── /sqlite               # Relational data mappers & migrations
│   │   └── /interfaces           # Repository contracts (Interfaces)
│   ├── /plugins                  # Plugin Engine & Sandboxes
│   │   ├── /loader               # Plugin discovery & manifest parser
│   │   └── /runtime              # Subprocess & WASM execution sandboxes
│   └── /infrastructure           # OS Adapters, Process Sandbox, File Manager
│       ├── /os                   # Win32, Cocoa, DBus OS wrappers
│       └── /security             # Encryption, Credential Vault, Sandboxing
├── /tests                        # Test Suite (Unit, Integration, Mocks)
└── main.py                       # Daemon Entry Point & Bootstrapper
```

---

## 5. Request Lifecycle

The flow of a request from the UI presentation layer through the backend daemon and back:

```
[UI Shell] --(1. Voice/Text Query)--> [IPC Server (API Layer)]
                                              |
                                      (2. Deserialize & Validate DTO)
                                              v
[Agent Planner (Service)] <---(3. Dispatch)--- [Task Orchestrator]
         |
    (4. Fetch Context) ---> [Memory Service] ---> [Vector DB]
         |
    (5. Route Prompt)  ---> [AI Layer Router] ---> [Model Endpoint]
         |                                               |
    (6. Parsed Plan) <-----------------------------------+
         |
    (7. Validate Safety) -> [Security Engine]
         |
   [Requires Approval?] --YES--> [IPC Notification] --> [UI Confirmation HUD]
         |                                                       |
        NO                                                (User Approves)
         |                                                       |
         +----------------<--------------------------------------+
         v
[Tool Sandbox (Infra)] --(8. Execute OS Action)--> [Host OS]
         |                                            |
    (9. Result DTO) <---------------------------------+
         |
         v
[Event Bus] --(10. Broadcast Status & Logs)--> [IPC Server] --> [UI Shell Update]
```

---

## 6. API Design

### 6.1 Internal API Principles
*   **Protocol:** High-speed WebSockets over local loopback (`127.0.0.1`) or OS Named Pipes for low-latency IPC.
*   **Versioning:** All API endpoints and IPC event payloads include explicit major version prefixes (e.g., `v1/agent/execute`, `v1.events.task_updated`).
*   **Naming Conventions:** camelCase for JSON properties, kebab-case for endpoint routes, dot.notation for IPC event names.

### 6.2 Standardized Response Format
All backend IPC responses return a unified envelope structure:

```json
{
  "success": true,
  "correlationId": "req_8f9a2b1c4e7d",
  "timestamp": "2026-07-23T19:26:33.000Z",
  "data": {
    "taskId": "task_1024",
    "status": "EXECUTING",
    "stepCount": 3
  },
  "error": null
}
```

### 6.3 Standardized Error Response Format
```json
{
  "success": false,
  "correlationId": "req_8f9a2b1c4e7d",
  "timestamp": "2026-07-23T19:26:33.000Z",
  "data": null,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Directory traversal outside active workspace is forbidden.",
    "details": {
      "requestedPath": "C:/Windows/System32",
      "allowedWorkspace": "D:/Projects/Specifications"
    }
  }
}
```

---

## 7. Service Layer
*   **Business Logic Isolation:** Services contain all procedural rules, execution validation loops, and workflow state changes. They never handle direct HTTP/IPC socket details.
*   **Service Communication:** Services communicate directly via injected interface dependencies or asynchronously via the Event Bus.
*   **Dependency Injection (DI):** All service constructors explicitly request interfaces rather than concrete implementations:

```python
# Conceptual Dependency Injection Contract
class AgentOrchestratorService:
    def __init__(
        self,
        memory_service: IMemoryService,
        ai_router: IAIBrainRouter,
        tool_sandbox: IToolSandboxRunner,
        event_bus: IEventBus
    ):
        self.memory = memory_service
        self.ai = ai_router
        self.sandbox = tool_sandbox
        self.bus = event_bus
```

---

## 8. Event Bus

### 8.1 Architecture
The Event Bus operates as an in-memory pub/sub message broker using non-blocking asynchronous event loops (`asyncio` / Go channels).

### 8.2 Event Naming Conventions
Events follow a `domain.entity.action` taxonomy:
*   `sensory.audio.chunk_captured`
*   `agent.plan.generated`
*   `security.permission.requested`
*   `tool.execution.completed`
*   `plugin.runtime.crashed`

### 8.3 Async Handler Registration
Handlers register asynchronously and execute independently without delaying the publisher thread:

```python
event_bus.subscribe("tool.execution.completed", audit_logger_service.on_tool_executed)
event_bus.subscribe("tool.execution.completed", ui_notification_service.broadcast_tool_result)
```

---

## 9. Plugin Architecture

```
+-----------------------------------------------------------------------+
| PLUGIN MANAGER                                                        |
|  1. Parse Manifest (plugin.json)                                      |
|  2. Verify Cryptographic Signature                                    |
|  3. Register Tools into Capability Registry                           |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
| ISOLATED RUNTIME SANDBOX                                              |
|  - Restricted Subprocess / WebAssembly (WASM) Engine                   |
|  - Denied raw filesystem access outside /plugin_data                   |
|  - Denied raw network sockets unless specified in permissions manifest |
+-----------------------------------------------------------------------+
```

*   **Lifecycle States:** `DISCOVERED` -> `VALIDATED` -> `LOADED` -> `ACTIVE` -> `PAUSED` -> `DISABLED` -> `UNINSTALLED`.
*   **Permissions:** Plugins must declare explicit permission scopes in `plugin.json` (e.g., `filesystem:read`, `network:fetch`).
*   **Isolation:** Plugins execute in isolated subprocesses or WASM runtimes, communicating with the core backend exclusively via sandboxed IPC pipes.

---

## 10. Configuration Management
*   **Environment Config:** Reads system environment variables for runtime flags (`JARVIS_ENV=production`, `JARVIS_LOG_LEVEL=DEBUG`).
*   **User Config:** Loaded from JSON/YAML configurations stored in user configuration directories (`~/.gemini/antigravity-ide/config/mcp.config.json`).
*   **Runtime Config:** In-memory configuration registry allowing dynamic setting updates without restarting backend daemons.
*   **Secrets Management:** Sensitive keys and passwords are NEVER written to disk in plain text. They are stored in host OS native vaults (Windows Credential Manager, macOS Keychain) and retrieved at runtime.

---

## 11. Logging System
*   **Structured Logging:** All backend modules emit JSON-formatted logs.
*   **Log Levels:** `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, `CRITICAL`.
*   **Contextual Tracing:** Logs automatically inherit context identifiers (`correlation_id`, `session_id`, `task_id`).
*   **Log Retention & Rotation:** Daily log file rotation capped at 50MB per file, retaining a maximum of 7 rolling logs to conserve local disk space.

---

## 12. Error Handling & Resilience
*   **Custom Exception Hierarchy:** `JarvisBaseException` -> `ValidationError`, `SecurityException`, `ModelInferenceError`, `ToolExecutionError`.
*   **System Recovery Strategy:** Unhandled exceptions in individual service threads are caught by high-level middleware, logged, and trigger a graceful task failure response without bringing down the core daemon.
*   **Retry Mechanisms:** Exponential backoff retry loops for network-dependent cloud model calls (retries: 3, delay: 500ms, 1000ms, 2000ms).

---

## 13. Security
*   **Input Validation:** Strict Pydantic / JSON-Schema validation on all API payloads before entering the Service Layer.
*   **Workspace Boundary Enforcer:** Canonical path checking (`os.path.realpath`) prevents directory traversal attacks outside configured user workspace paths.
*   **Execution Sandbox:** Commands are strictly categorized (`SAFE`, `WARNING`, `CRITICAL`), requiring user verification prompts for elevated actions.
*   **Credential Masking:** Automated regex filtering screens log files and model prompts to redact API keys, JWT tokens, and private passwords.

---

## 14. Performance Strategy
*   **Asynchronous I/O:** All file operations, database queries, and network requests utilize asynchronous non-blocking calls (`async/await`).
*   **Caching Layer:** High-frequency read queries (user preferences, tool manifests, token templates) are cached in transient memory with sliding TTLs.
*   **Background Worker Pools:** Intensive tasks (such as local model inference or vector embedding generation) are offloaded to dedicated background process pools to keep the main event loop sub-millisecond responsive.

---

## 15. Scalability
The backend supports future module expansion without architectural overhauls by:
1.  Enforcing clean interface contracts for all services.
2.  Utilizing the Event Bus for inter-service notifications (eliminating tight class coupling).
3.  Exposing dynamic tool capabilities that register automatically with the AI model router during system boot.

---

## 16. Testing Strategy
*   **Unit Tests:** Test individual domain rules, DTO validations, and utility routines with 100% mock dependencies (Target Coverage: >85%).
*   **Integration Tests:** Validate interaction between Services, Repositories, SQLite databases, and Event Bus pipelines.
*   **API Tests:** Test IPC WebSocket endpoints against predefined structural request/response DTOs.
*   **Mock Services:** Provide complete mock implementations for OS tools, cloud APIs, and sensory devices during automated CI build runs.

---

## 17. Coding Standards
1.  **Strict Typing:** 100% type annotation coverage across Python (`mypy --strict`) or Go codebases.
2.  **No Direct Global State:** State must be owned by services managed through the Dependency Injection container.
3.  **Explicit Exception Handling:** Never catch bare `Exception` or swallow errors without logging stack traces.
4.  **Zero Raw Magic Strings:** Use Enums or Constants for all status strings, event names, and configuration keys.

---

## 18. Acceptance Criteria
*   [ ] The backend daemon boots up and initializes all core services in < 1.0 second.
*   [ ] 100% of incoming IPC payloads undergo structural DTO validation before hitting service logic.
*   [ ] File operations strictly enforce workspace directory boundaries, preventing traversal.
*   [ ] Event Bus successfully handles 10,000 internal pub/sub messages per second without dropping payloads.
*   [ ] All sensitive credentials are retrieved exclusively from native host OS key vaults.

---

## 19. Conclusion
This Backend Architecture Specification provides the definitive engineering framework for the JARVIS-X operating engine. By adhering to clean layered boundaries, asynchronous event-driven design, isolated plugin sandboxes, robust security boundaries, and strict dependency injection, the backend ensures JARVIS-X functions as a state-of-the-art, highly reliable, and enterprise-ready AI Operating System.
