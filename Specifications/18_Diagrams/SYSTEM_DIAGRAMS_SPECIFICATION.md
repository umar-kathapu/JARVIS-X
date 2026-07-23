# JARVIS-X System Diagrams Specification

**Document Version:** 1.0.0-draft  
**Last Updated:** 2026-07-23  
**Status:** Active Draft  
**Target System:** JARVIS-X Visual Architecture & Diagram Subsystem  

---

## 1. Purpose
The System Diagrams Specification serves as the definitive visual architecture blueprint for JARVIS-X. As a multi-layered AI Operating System bridging frontend overlays, background daemons, sensory streams, vector databases, multi-agent swarms, and sandboxed plugins, visual diagrams are essential. This document provides standardized, maintainable Mermaid diagrams illustrating system boundaries, interaction flows, sequence topologies, entity relationships, and deployment architectures for developers, architects, and open-source contributors.

---

## 2. Vision
To maintain an expressive, code-integrated visual architecture that evolves alongside the codebase. Inspired by the interactive holographic schematics of Iron Man's JARVIS, this visual specification ensures that complex software patterns—such as multi-agent handoffs, hybrid vector retrieval, and prompt injection security gates—are immediately consumable, self-documenting, and easy to maintain.

---

## 3. Diagram Standards & Taxonomy
JARVIS-X mandates using [Mermaid.js](https://mermaid.js.org/) for all visual diagrams stored directly within markdown documentation.

*   **Flowcharts (`graph TD` / `graph LR`):** Used for process lifecycles, data enrichment pipelines, and decision trees.
*   **Sequence Diagrams (`sequenceDiagram`):** Used for synchronous/asynchronous inter-process communication, IPC socket exchanges, and multi-agent handoff protocols.
*   **Component Diagrams (`graph TD` inside subgraphs):** Used for subsystem boundaries, layer dependencies, and plugin SDK gateways.
*   **Entity Relationship Diagrams (`erDiagram`):** Used for relational databases schemas, SQLite table relationships, and memory metadata structures.
*   **Deployment Diagrams (`graph LR`):** Used for CI/CD compilation matrix pipelines, desktop installer distribution, and cloud API proxy topologies.

---

## 4. System Context Diagram

The System Context diagram illustrates the high-level boundary of JARVIS-X relative to the user, local desktop environment, external AI model endpoints, and third-party services:

```mermaid
graph TD
    User([User]) <-->|Voice / Vision / Keyboard| DesktopApp["JARVIS-X Desktop Shell (UI HUD)"]
    
    subgraph LocalSystem ["Local Host Machine"]
        DesktopApp <-->|Local IPC / WebSocket| CoreDaemon["JARVIS-X Backend Daemon"]
        CoreDaemon <-->|Process Sandboxing| LocalTools["Host OS & Tools (Win32 / Bash / Files)"]
        CoreDaemon <-->|ACID Transactions| LocalDB[(SQLite & Vector DB)]
        CoreDaemon <-->|Restricted API| WASMPlugins["Sandboxed WASM Plugins"]
    end
    
    subgraph ExternalCloud ["External Cloud Services"]
        CoreDaemon <-->|TLS 1.3 REST / gRPC| CloudLLM["Cloud AI Providers (Gemini / Claude / OpenAI)"]
        CoreDaemon <-->|HTTPS Webhooks| ExternalAPIs["External Web Services (GitHub / Jira)"]
        CoreDaemon <-->|HTTPS Auto-Update| UpdateServer["Auto-Update Server"]
    end
```

---

## 5. High-Level System Architecture Diagram

```mermaid
graph TD
    subgraph Presentation ["Presentation Layer"]
        HUD["Glassmorphic HUD Overlay"]
        Sidebar["Sidebar & System Tray"]
        CmdPalette["Global Command Palette (Ctrl+K)"]
    end

    subgraph Communication ["Communication Layer"]
        IPC["WebSocket / IPC Server"]
        Validator["Request DTO Validator"]
    end

    subgraph CoreEngine ["Core Daemon Engine"]
        Orchestrator["Agent Orchestration Engine"]
        EventBus["Central Event Bus"]
        Planner["Task Planner (DAG)"]
        Security["Security Gateway & Permission Manager"]
    end

    subgraph Intelligence ["Intelligence & Storage"]
        AIRouter["AI Provider Router"]
        MemoryEngine["Memory Engine (Hybrid Vector Search)"]
        PluginEngine["Plugin Sandbox Manager"]
        AutoEngine["Automation Engine (Playwright / OS Drivers)"]
    end

    Presentation <--> Communication
    Communication <--> CoreEngine
    CoreEngine <--> Intelligence
```

---

## 6. Component Architecture Diagram

```mermaid
graph TD
    subgraph UIModule ["UI Subsystem"]
        ReactShell["React / Electron Window Shell"]
        DesignTokens["CSS Custom Properties Tokens"]
    end

    subgraph BackendModule ["Backend Subsystem"]
        DaemonMain["Daemon Bootstrapper"]
        DIService["Dependency Injection Container"]
    end

    subgraph AIModule ["AI Subsystem"]
        IntentAnalyzer["Intent Analyzer"]
        PromptAssembler["Context & Prompt Assembler"]
        ProviderAdapters["OpenAI / Gemini / Ollama Adapters"]
    end

    subgraph MemoryModule ["Memory Subsystem"]
        SQLiteDriver["SQLite FTS5 Driver"]
        VectorDriver["ChromaDB / Qdrant Adapter"]
    end

    subgraph AutomationModule ["Automation Subsystem"]
        WorkflowCompiler["Workflow DAG Compiler"]
        OSDrivers["Win32 / AppleScript / DBus Drivers"]
    end

    UIModule <--> BackendModule
    BackendModule <--> AIModule
    BackendModule <--> MemoryModule
    BackendModule <--> AutomationModule
```

---

## 7. User Request Lifecycle Flowchart

```mermaid
graph TD
    Start([User Input Triggered]) --> Ingestion["Input Capture (Text / Voice / Screenshot)"]
    Ingestion --> DTOVal["Validate Payload & Assign Correlation ID"]
    DTOVal --> Intent["Analyze Intent & Extract Entities"]
    Intent --> MemoryFetch["Fetch Hybrid Context (SQLite + Vector DB)"]
    MemoryFetch --> PlanGen["Generate Task Plan (DAG Graph)"]
    PlanGen --> SafetyCheck{"Is Tool Action Critical?"}
    
    SafetyCheck -- Yes --> PromptUser["Display HUD Approval Dialog"]
    PromptUser --> UserChoice{"User Approved?"}
    UserChoice -- No --> Abort["Abort Task & Notify User"]
    UserChoice -- Yes --> Execute
    
    SafetyCheck -- No --> Execute["Execute Sandboxed Tool Node"]
    Execute --> AuditLog["Log Action to Cryptographic Audit DB"]
    AuditLog --> BuildResp["Assemble Response Payload"]
    BuildResp --> StreamUI["Stream Token Response & Audio to UI"]
    StreamUI --> End([Request Complete])
```

---

## 8. AI Brain Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant UI as Presentation Shell
    participant Router as AI Provider Router
    participant Mem as Memory Engine
    participant Agent as Specialized Agent
    participant LLM as Model Endpoint (Cloud/Local)

    User->>UI: Input Query ("Build project and update docs")
    UI->>Router: Dispatch Request DTO
    Router->>Mem: Query Hybrid Memory Context
    Mem-->>Router: Return Relevant Facts & Vector Embeddings
    Router->>LLM: Ingest Prompt + Context + Tool Manifests
    LLM-->>Router: Return Action Plan (DAG)
    Router->>Agent: Dispatch Task Node to CodingAgent
    Agent->>Agent: Execute Sandboxed Tool Action
    Agent-->>Router: Return Tool Execution Success DTO
    Router->>LLM: Ingest Tool Output for Final Formatting
    LLM-->>Router: Stream Final Answer Tokens
    Router-->>UI: Stream Markdown & Voice Synthesis Payloads
    UI-->>User: Render HUD Output & Play Audio
```

---

## 9. Memory Storage & Retrieval Flow Diagram

```mermaid
graph TD
    subgraph IngestionFlow ["Memory Ingestion"]
        NewFact["New User Fact / Session Event"] --> Classify["Classify Memory Type & Tags"]
        Classify --> Redact["Sanitize Passwords & PII"]
        Redact --> RelationalWrite["Write to SQLite Relation (FTS5)"]
        Redact --> VectorEmbed["Generate Vector Embedding"]
        VectorEmbed --> VectorWrite["Insert into ChromaDB HNSW Index"]
    end

    subgraph QueryFlow ["Memory Retrieval"]
        Query["AI Context Query"] --> HybridSearch["Hybrid Search Controller"]
        HybridSearch --> FTSQuery["SQLite Keyword Search"]
        HybridSearch --> VecQuery["Cosine Similarity Vector Search"]
        FTSQuery --> Ranker["Ranking Engine (Recency x Importance x Similarity)"]
        VecQuery --> Ranker
        Ranker --> Budget["Token Budgeting Filter (< 2048 Tokens)"]
        Budget --> ContextInject["Inject Markdown Block into System Prompt"]
    end
```

---

## 10. Multi-Agent Collaboration Diagram

```mermaid
graph TD
    TaskPlanner["Task Planner (DAG)"] -->|Assign Sub-Task 1| ResearchAgent["Research Agent"]
    TaskPlanner -->|Assign Sub-Task 2| VisionAgent["Vision Agent"]

    ResearchAgent -->|Fetch Web Docs| SharedContext[("Shared Memory Context Store")]
    VisionAgent -->|OCR Screenshot| SharedContext

    SharedContext -->|Read Combined Inputs| CodingAgent["Coding Agent"]
    CodingAgent -->|Execute Script Edit| ToolSandbox["Sandbox Tool Runner"]
    ToolSandbox -->|Execution Result| Aggregator["Result Aggregator"]
    Aggregator -->|Final Composite Output| ResponseBuilder["Response Builder"]
```

---

## 11. Plugin Architecture & Gateway Diagram

```mermaid
graph TD
    subgraph HostCore ["Host Backend Core Daemon"]
        PluginManager["Plugin Manager"]
        PermissionGate["Permission Scope Gatekeeper"]
        APIGateway["Plugin API Gateway"]
    end

    subgraph SandboxBoundary ["Isolated Plugin Runtime"]
        WASMRuntime["WebAssembly (WASM) Sandbox"]
        SubprocessRuntime["Subprocess Sandbox"]
    end

    subgraph PluginPackage ["Third-Party Plugin (.jarvis-plugin)"]
        Manifest["Manifest (plugin.json)"]
        PluginCode["Plugin Binary / JS Code"]
    end

    PluginPackage -->|Load & Register| PluginManager
    PluginManager -->|Verify Signatures| PermissionGate
    PermissionGate -->|Grant Approved Scopes| SandboxBoundary
    SandboxBoundary <-->|Safe API Calls| APIGateway
```

---

## 12. Automation Engine Workflow Diagram

```mermaid
graph TD
    Trigger["Automation Trigger (Time Cron / System Event / User Hotkey)"] --> TaskQueue["Priority Task Queue"]
    TaskQueue --> Manager["Automation Manager"]
    Manager --> DryRunCheck{"Dry Run Enabled?"}
    
    DryRunCheck -- Yes --> GenPreview["Generate Visual Simulation Preview"] --> UserHUD["Render HUD Preview"]
    DryRunCheck -- No --> CheckPermission{"Is Action Critical?"}
    
    CheckPermission -- Yes --> ApprHUD["Prompt User for Execution Approval"]
    ApprHUD --> UserApproval{"Approved?"}
    UserApproval -- No --> AbortWF["Abort Workflow & Log"]
    UserApproval -- Yes --> ExecDriver
    
    CheckPermission -- No --> ExecDriver["Execute Driver (Win32 / Playwright / Shell)"]
    ExecDriver --> Evaluate{"Step Succeeded?"}
    
    Evaluate -- Yes --> LogAudit["Write Cryptographic Audit Log"] --> NextStep["Proceed to Next Workflow Node"]
    Evaluate -- No --> Rollback{"Has Rollback Hook?"}
    Rollback -- Yes --> ExecRollback["Execute Compensating Rollback Steps"]
    Rollback -- No --> NotifyFail["Alert User & Log Failure"]
```

---

## 13. Database ER Diagram

```mermaid
erDiagram
    USER {
        string id PK
        string name
        string theme_preference
        string security_policy_level
        datetime created_at
    }

    CONVERSATION {
        string id PK
        string user_id FK
        string title
        string status
        datetime created_at
    }

    MESSAGE {
        string id PK
        string conversation_id FK
        string role
        string content
        integer tokens_used
        datetime timestamp
    }

    TOOL_CALL {
        string id PK
        string message_id FK
        string tool_name
        string parameters_json
        string output_json
        string status
    }

    MEMORY_FACT {
        string id PK
        string category
        string fact_text
        float importance_score
        string vector_id
        datetime last_accessed
    }

    USER ||--o{ CONVERSATION : owns
    CONVERSATION ||--o{ MESSAGE : contains
    MESSAGE ||--o{ TOOL_CALL : triggers
    USER ||--o{ MEMORY_FACT : retains
```

---

## 14. Deployment Architecture Diagram

```mermaid
graph LR
    subgraph DevEnv ["Development Environment"]
        Dev[Developer Workstation] -->|Git Push| Repo[GitHub Repository]
    end

    subgraph CI ["CI/CD Pipeline (GitHub Actions)"]
        Repo --> TestRunner[Automated Unit & Security Tests]
        TestRunner --> MultiBuild[Cross-Platform Build Matrix]
        MultiBuild --> Signer[EV Code Signing & Apple Notarization]
    end

    subgraph Dist ["Distribution Layer"]
        Signer --> ArtifactStore[GitHub Releases / AWS S3]
    end

    subgraph Clients ["End-User Workstations"]
        ArtifactStore -->|Auto-Update / Installer| WinClient["Windows Setup (.msi)"]
        ArtifactStore -->|Auto-Update / Installer| MacClient["macOS Bundle (.dmg)"]
        ArtifactStore -->|Auto-Update / Installer| LinClient["Linux Package (.deb)"]
    end
```

---

## 15. Security Architecture Diagram

```mermaid
graph TD
    Incoming["Incoming Request / External Payload"] --> Layer1["Gate 1: Input Sanitizer & Regex Scrubber"]
    Layer1 --> Layer2["Gate 2: Authentication (Session Token / Passkey)"]
    Layer2 --> Layer3["Gate 3: Authorization (RBAC / ABAC Scope Verification)"]
    Layer3 --> Layer4["Gate 4: Prompt Injection Defense & Dual-LLM Audit"]
    Layer4 --> Layer5["Gate 5: Permission Manager (Safe / Warning / Critical HUD)"]
    Layer5 --> Layer6["Gate 6: Sandboxed Execution & Process Isolation"]
    Layer6 --> AuditDB[("Append-Only Cryptographic Audit Log (audit_chain.db)")]
```

---

## 16. Diagram Maintenance Guidelines
*   **Version Control:** All diagrams must be written in standard Mermaid text syntax embedded within `/Specifications` markdown files.
*   **Naming Conventions:** Node IDs must use clear camelCase or PascalCase names; labels must be descriptive.
*   **Syntax Hygiene:** Special characters in labels must be enclosed inside double quotes (e.g., `id["Label (Info)"]`). HTML tags inside labels are strictly prohibited.
*   **Synchronization:** Any architectural change to core code interfaces, IPC protocols, or security gates requires an immediate corresponding update to this specification file.

---

## 17. Best Practices
1.  **Keep Diagrams Focused:** Limit individual diagrams to a single conceptual responsibility to maintain legibility.
2.  **Use Consistent Palette & Shapes:** Represent actors with rounded nodes `([User])`, databases with cylinder nodes `[(Database)]`, and decision points with diamond nodes `{"Decision?"}`.
3.  **Validate Syntax:** Verify all Mermaid diagrams compile cleanly using GitHub Markdown preview or Mermaid CLI before committing changes.

---

## 18. Acceptance Criteria
*   [ ] 100% of architectural subsystems possess explicit, compiling Mermaid diagrams.
*   [ ] All Mermaid nodes containing special characters use valid double-quote escaping.
*   [ ] Sequence and component diagrams accurately reflect current API and security gate contracts.
*   [ ] ER diagram accurately reflects the relational database SQLite schema definitions.

---

## 19. Conclusion
The System Diagrams Specification provides the master visual blueprint for JARVIS-X. By establishing standardized Mermaid flowcharts, sequence diagrams, component topologies, ER schemas, security validation gates, and deployment matrices, this document ensures that developers, architects, and open-source contributors maintain a shared visual understanding of the JARVIS-X AI Operating System throughout its lifecycle.
