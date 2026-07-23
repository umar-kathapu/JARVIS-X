# AI Development Guide

Welcome to the **JARVIS-X** AI Development Guide. JARVIS-X is an enterprise-grade, Iron Man-inspired AI Operating System designed to deliver real-time multi-modal intelligence, voice interface control, computer vision perception, autonomous task execution, and desktop integration.

This document serves as the authoritative, implementation-ready architectural manual for building, orchestrating, and scaling the **AI Brain**—the core intelligence system of JARVIS-X.

---

## 1. Purpose

The AI Brain is the cognitive core of JARVIS-X. It transforms raw multi-modal inputs (voice, text, vision streams, system telemetry) into structured intent, autonomous task plans, tool executions, and contextual responses. Its primary responsibilities include:

- **Intent Recognition & Task Planning**: Parsing complex user requests into structured, execution-ready DAG (Directed Acyclic Graph) task trees.
- **Provider-Agnostic Model Routing**: Dynamically selecting and invoking local LLMs (Ollama/vLLM) or cloud models (OpenAI/Anthropic/Gemini) based on task complexity, cost, and latency budgets.
- **Tool Execution & Agent Coordination**: Orchestrating autonomous sub-agents (Planner, Coder, Researcher, Executor) and calling system tools safely.
- **Contextual Memory & RAG Retrieval**: Integrating short-term conversation context with long-term vector semantic memory to maintain deep situational awareness.

---

## 2. AI Vision

The vision for the JARVIS-X AI Brain is to create a context-aware, self-correcting, multi-modal intelligence system capable of operating with near-zero latency while maintaining user privacy and execution safety.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           JARVIS-X AI BRAIN                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌───────────────────┐    ┌───────────────────┐    ┌────────────────┐  │
│   │ MULTI-MODAL       │    │ LOCAL-FIRST AI    │    │ MULTI-AGENT    │  │
│   │ Voice, Vision,    │    │ Ollama / PyTorch  │    │ Collaboration  │  │
│   │ Text & Telemetry  │    │ Cloud Bursting    │    │ & Tool Calling │  │
│   └─────────┬─────────┘    └─────────┬─────────┘    └───────┬────────┘  │
│             │                        │                      │           │
│             └────────────────────────┼──────────────────────┘           │
│                                      │                                  │
│                   ┌──────────────────▼──────────────────┐               │
│                   │      CONTINUOUS RAG MEMORY          │               │
│                   │ Short/Long-Term Semantic Knowledge  │               │
│                   └─────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Tenets

1. **Local-First with Cloud Bursting**: Execute high-frequency, privacy-sensitive tasks locally using lightweight models (Llama 3 8B, Qwen 2.5), automatically escalating to cloud frontier models (Claude 3.5 Sonnet, GPT-4o) for complex reasoning.
2. **Deterministic Tool Boundaries**: Combine non-deterministic neural LLM reasoning with deterministic code validation and strict tool schemas.
3. **Sub-Second Reactive Feedback**: Stream initial response tokens under **300ms** to support real-time audio visualizers and UI feedback loops.

---

## 3. AI Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              AI TECH STACK                              │
├───────────────┬──────────────────────────┬──────────────────────────────┤
│ Category      │ Technology               │ Purpose & Role               │
├───────────────┼──────────────────────────┼──────────────────────────────┤
│ Cloud Models  │ OpenAI API (GPT-4o)      │ Fast multimodal fallback     │
│ Cloud Models  │ Anthropic (Claude 3.5)   │ Deep reasoning & agent plans │
│ Cloud Models  │ Google (Gemini 1.5 Pro)  │ Massive context & vision     │
│ Local Engine  │ Ollama                   │ Local GGUF model execution   │
│ Local Engine  │ LM Studio / vLLM         │ Local OpenAI-compatible server│
│ Orchestration │ LangChain / Custom Core  │ Chain execution & agent loops│
│ Embeddings    │ nomic-embed-text / OpenAI│ Vector embeddings generation │
│ Vector DB     │ Qdrant / pgvector        │ Semantic long-term memory    │
└───────────────┴──────────────────────────┴──────────────────────────────┘
```

---

## 4. AI Architecture

The AI Brain follows a modular pipeline processing requests from initial ingestion to final validated output.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AI BRAIN ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   USER REQUEST (Voice / Text / Vision)                                  │
│         │                                                               │
│         ▼                                                               │
│  ┌──────────────┐    ┌─────────────────┐    ┌────────────────────────┐  │
│  │ INTENT PARSER│───►│ CONTEXT RETRIEVER│───►│ PROMPT BUILDER         │  │
│  └──────────────┘    │ (Vector Memory) │    │ (System Prompt + RAG)  │  │
│                      └─────────────────┘    └───────────┬────────────┘  │
│                                                         │               │
│                                                         ▼               │
│  ┌──────────────┐    ┌─────────────────┐    ┌────────────────────────┐  │
│  │ RESPONSE     │◄───│ TOOL EXECUTION  │◄───│ AI PROVIDER ROUTER     │  │
│  │ VALIDATOR    │    │ ENGINE          │    │ (Ollama/Claude/GPT-4o) │  │
│  └──────┬───────┘    └─────────────────┘    └────────────────────────┘  │
│         │                                                               │
│         ▼                                                               │
│   STREAMING OUTPUT (UI / Speech / Desktop Action)                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

1. **User Request Processing**: Normalizes input payloads from WebSockets, voice transcripts, or vision detection frames.
2. **Context Builder**: Pulls short-term conversation logs, current system telemetry (CPU/GPU/RAM), and user preferences.
3. **Prompt Builder**: Assembles structured system prompts, injection variables, dynamic tools schemas, and RAG context chunks.
4. **AI Provider Layer**: Routes prompts to appropriate local or cloud model endpoints using unified interfaces.
5. **Response Processor**: Validates, parses, and cleans model responses (extracting JSON, Markdown code blocks, or raw streaming tokens).
6. **Tool Calling Engine**: Intercepts function-call payloads, verifies argument types via Pydantic, and executes background system functions safely.
7. **Memory Integration**: Saves interaction history and updates semantic embeddings in the vector database.
8. **Agent Coordination**: Manages multi-agent execution loops when handling complex multi-step workflows.

---

## 5. AI Provider Abstraction

To avoid vendor lock-in and enable seamless offline fallback, all AI models implement a unified abstract base class:

```python
# src/ai/providers/base.py
from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any, List

class BaseAIProvider(ABC):
    @abstractmethod
    async def generate_completion(
        self, 
        prompt: str, 
        system_prompt: str, 
        tools: List[Dict[str, Any]] = None,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Generate a complete non-streaming response."""
        pass

    @abstractmethod
    async def generate_stream(
        self, 
        prompt: str, 
        system_prompt: str,
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        """Yield response tokens incrementally for streaming UI."""
        pass
```

---

### Failover & Model Routing Matrix

```
                      ┌────────────────────────────┐
                      │    INCOMING USER PROMPT    │
                      └─────────────┬──────────────┘
                                    │
                     ┌──────────────▼──────────────┐
                     │   IS NETWORK AVAILABLE &    │
                     │   COMPLEXITY > THRESHOLD?   │
                     └──────┬──────────────┬───────┘
                        YES │              │ NO (Simple / Offline)
                            │              │
            ┌───────────────▼──────┐    ┌──▼────────────────────────┐
            │ CLOUD FRONTIER MODEL │    │ LOCAL OLLAMA INFERENCE    │
            │ (Claude 3.5 / GPT-4o)│    │ (Llama-3 8B / Qwen 2.5)   │
            └───────────────┬──────┘    └───────────┬───────────────┘
                            │                       │
                            │ (On Cloud Error)      │ (On OOM / Timeout)
                            ▼                       ▼
            ┌───────────────────────────────────────────────┐
            │           FALLBACK ROUTE EXECUTED             │
            └───────────────────────────────────────────────┘
```

---

## 6. Prompt Engineering

JARVIS-X uses structured, versioned prompt templates stored in `src/ai/prompts/`.

### 6.1 System Prompt Architecture

```markdown
# JARVIS-X System Prompt Template (v1.2)

You are **JARVIS-X**, an advanced AI Operating System inspired by Iron Man's JARVIS. 
Your tone is professional, concise, intelligent, and slightly witty.

## Core Operational Rules:
1. Always prioritize user safety and privacy.
2. Return execution steps cleanly formatted in GitHub Markdown.
3. When invoking system tools, output ONLY valid JSON tool calls matching the specified function schema.
4. Keep natural language responses direct and actionable (under 3 sentences unless detailed explanation is requested).

## Current System Context:
- Host OS: {{ system_os }}
- Hardware Status: CPU {{ cpu_usage }}% | GPU {{ gpu_usage }}% | RAM {{ ram_available }} GB free
- Active User: {{ user_name }}
```

---

### 6.2 Structured JSON Output Enforcement

When requiring strict output formats (such as plan graphs or tool arguments), prompts mandate JSON schema compliance backed by **Pydantic**:

```python
from pydantic import BaseModel, Field
from typing import List

class TaskStep(BaseModel):
    step_id: int
    action_type: str = Field(description="tool_call | user_response | system_cmd")
    tool_name: str
    arguments: dict

class ExecutionPlan(BaseModel):
    goal: str
    estimated_latency_ms: int
    steps: List[TaskStep]
```

---

## 7. Memory Integration

The memory architecture combines fast short-term buffer memory with long-term vector semantic search.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      HYBRID MEMORY ARCHITECTURE                         │
├───────────────────────────────────┬─────────────────────────────────────┤
│ Memory Layer                      │ Storage Engine & Mechanism          │
├───────────────────────────────────┼─────────────────────────────────────┤
│ **Short-Term Memory**             │ Redis sliding conversation window   │
│ (Active Session Context)          │ (Last N turns + summary buffer)     │
├───────────────────────────────────┼─────────────────────────────────────┤
│ **Long-Term Episodic Memory**     │ Qdrant Vector DB                    │
│ (User Facts & Saved Preferences)  │ (Cosine similarity vector search)   │
├───────────────────────────────────┼─────────────────────────────────────┤
│ **RAG Document Vault**            │ Hybrid Dense (nomic-embed) +        │
│ (Project Specs & Source Code)     │ Sparse (BM25) Lexical Index         │
└───────────────────────────────────┴─────────────────────────────────────┘
```

---

## 8. Tool Calling Engine

Tools allow the AI Brain to interact directly with the underlying host environment (file system, hardware sensors, API endpoints).

### Tool Registration & Definition Example

```python
# src/ai/tools/system_tools.py
from src.ai.tools.registry import register_tool
from pydantic import BaseModel, Field

class GetSystemStatusInput(BaseModel):
    include_gpu: bool = Field(default=True, description="Whether to include GPU metrics.")

@register_tool(
    name="get_system_status",
    description="Fetches live CPU, GPU, RAM, and thermal metrics from host operating system.",
    args_schema=GetSystemStatusInput
)
async def get_system_status(include_gpu: bool = True) -> dict:
    # Execute native system query
    return {
        "cpu_usage_percent": 14.2,
        "ram_used_gb": 8.4,
        "gpu_temp_celsius": 42.0 if include_gpu else None
    }
```

---

## 9. Multi-Agent Collaboration

For complex autonomous objectives (such as "Build a new React widget and integrate it into the dashboard"), JARVIS-X delegates tasks to specialized sub-agents:

```
                    ┌───────────────────────────────┐
                    │       COORDINATOR AGENT       │
                    └───────────────┬───────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
┌─────────▼─────────┐     ┌─────────▼─────────┐     ┌─────────▼─────────┐
│   PLANNER AGENT   │     │  RESEARCH AGENT   │     │   CODING AGENT    │
│ Decomposes Goal   │     │ Searches Memory   │     │ Writes Code &     │
│ into Task Graph   │     │ & Web Specs       │     │ Executes Unit Tests│
└───────────────────┘     └───────────────────┘     └───────────────────┘
```

---

## 10. Reasoning Pipeline (Lifecycle)

Every user query undergoes an 8-stage execution lifecycle:

$$\text{User Request} \longrightarrow \text{Intent Detection} \longrightarrow \text{Context Retrieval} \longrightarrow \text{Planning} \longrightarrow \text{Tool Execution} \longrightarrow \text{AI Reasoning} \longrightarrow \text{Response Validation} \longrightarrow \text{Final Response}$$

1. **User Request**: Payload received via Voice (Whisper transcription) or Text Input.
2. **Intent Detection**: Lightweight classifier parses request category (`QUERY`, `ACTION`, `AUTOMATION_TASK`).
3. **Context Retrieval**: Pulls relevant short-term history and queries Qdrant for semantic RAG memories.
4. **Planning**: If request is an `ACTION`, the Planner Agent generates a step-by-step tool plan.
5. **Tool Execution**: Tool Engine validates schemas and executes system functions asynchronously.
6. **AI Reasoning**: Primary model synthesizes tool results and formulates final response.
7. **Response Validation**: Guardrails inspect output for safety, schema compliance, and format correctness.
8. **Final Response**: Incremental tokens streamed back to Frontend UI and Text-To-Speech engine.

---

## 11. Local AI Integration

Local AI capabilities allow JARVIS-X to run fully offline without cloud dependencies.

- **Ollama Integration**: Interfaced via local REST endpoints (`http://localhost:11434/api/generate`).
- **GPU Acceleration**:
  - **NVIDIA CUDA**: PyTorch & vLLM configured with `device="cuda:0"` (FP16 / INT8 quantization).
  - **Apple Silicon (MPS)**: Metal Performance Shaders for Mac workstations (`device="mps"`).
- **CPU Fallback**: Automatic quantized GGUF execution via `llama.cpp` bindings when GPU VRAM is full.

---

## 12. Performance Optimization

1. **Token Streaming**: Stream tokens using SSE (`text/event-stream`) to achieve **<200ms Time-To-First-Token (TTFT)**.
2. **Prompt Prefix Caching**: Cache static system prompt prefixes in memory to eliminate redundant pre-fill token processing costs.
3. **Parallel Tool Execution**: Execute independent tool steps concurrently using `asyncio.gather()`.
4. **Token Budget Trimming**: Dynamically summarize or trim older conversation turns when context window exceeds 80% capacity.

---

## 13. AI Security & Guardrails

- **Prompt Injection Defense**: Sanitize user inputs using regex barriers and isolate external data within strict XML boundary tags (`<untrusted_user_input>...</untrusted_user_input>`).
- **Destructive Tool Approvals**: Require explicit user UI confirmation before executing destructive system actions (such as file deletion, command execution, or system reboot).
- **PII & Secret Masking**: Automatically redact API keys (`sk-...`), passwords, and private tokens before sending prompts to external cloud models.

---

## 14. AI Testing & Evaluation

Testing AI pipelines requires continuous evaluation against benchmarks:

- **Prompt Evaluations**: Evaluated using **Promptfoo** and **Ragas** against a suite of 100+ standard test cases.
- **Faithfulness & Hallucination Checks**: Verify that RAG responses are strictly grounded in retrieved vector context documents.
- **Tool Schema Validation**: Automated unit tests verifying 100% schema match for registered function calls.

---

## 15. Coding Standards

- **Folder Organization**: All AI source code lives in `Development/03_AI/src/`.
- **Naming Conventions**: Python module names must use `snake_case`; class names must use `PascalCase`.
- **Structured AI Logging**: Log all model prompts, token usage, and latency using structured JSON formatting:
  ```python
  logger.info({
      "event": "llm_completion_finish",
      "model": "llama3:8b",
      "prompt_tokens": 412,
      "completion_tokens": 85,
      "total_latency_ms": 340
  })
  ```

---

## 16. Best Practices

1. **Vendor Independence**: Never rely on vendor-specific SDK quirks. Always use the `BaseAIProvider` abstraction.
2. **Deterministic Fallbacks**: Design every AI feature with a simple, non-AI rule-based fallback if the AI engine is offline.
3. **Strict Validation**: Always validate model-generated JSON using Pydantic schemas before passing objects to system handlers.

---

## 17. Acceptance Criteria

The AI Brain subsystem is complete and deployment-ready when:

- [ ] **Provider Abstraction**: Local Ollama, OpenAI, and Anthropic providers pass all unit tests under unified interface.
- [ ] **Streaming Latency**: Time-to-First-Token (TTFT) is verified under **300ms** on local workstation.
- [ ] **Tool Execution**: Multi-step tool calls execute correctly with schema validation passing 100% of cases.
- [ ] **Memory Integration**: Vector search returns relevant RAG documents with top-k precision > 85%.
- [ ] **Security Guardrails**: Prompt injection test cases successfully blocked; sensitive keys masked automatically.

---

## 18. Conclusion

Following this AI Development Guide ensures that the JARVIS-X AI Brain remains intelligent, modular, fast, and secure. By standardizing provider abstractions, prompt engineering, RAG memory retrieval, tool execution, and safety guardrails, developers can build a world-class AI Operating System core.
