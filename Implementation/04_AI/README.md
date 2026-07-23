# 04_AI

## Purpose
The `04_AI` folder contains the cognitive intelligence engine ("AI Brain") of JARVIS-X. Written in Python 3.12 and PyTorch, it orchestrates local LLM inference engines (Ollama, vLLM, GGUF), cloud AI providers (Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro), prompt engineering pipelines, tool calling execution, and multi-agent network collaboration.

---

## Responsibilities
- **Intent Parsing & Reasoning**: Parsing raw voice, text, or vision inputs into actionable execution plans.
- **Provider-Agnostic Model Routing**: Abstracting LLM providers via a unified `BaseAIProvider` interface with automatic local-to-cloud failover.
- **Tool Calling Engine**: Intercepting model function-call outputs and executing system tools cleanly via Pydantic validation.
- **Multi-Agent Orchestration**: Coordinating specialized sub-agents (Planner, Coder, Researcher, Executor, Reviewer).
- **Sub-300ms Token Streaming**: Streaming initial token responses incrementally over Server-Sent Events (SSE) and WebSockets.

---

## Files Created in this Folder
- `src/server.py`: FastAPI / Uvicorn server launcher exposing AI completion endpoints.
- `src/providers/base.py`: Abstract base class definition for AI providers.
- `src/providers/ollama.py`: Local Ollama inference integration.
- `src/providers/openai.py`: OpenAI GPT-4o model integration.
- `src/providers/anthropic.py`: Anthropic Claude 3.5 Sonnet model integration.
- `src/orchestrator.py`: AI model router, prompt builder, and circuit breaker.
- `src/agents/`: Multi-agent collaboration modules (`planner.py`, `coder.py`, `executor.py`).
- `src/tools/`: Tool call definitions and Pydantic argument schemas.

---

## Development Workflow
1. Navigate to `Implementation/04_AI/`.
2. Activate Python 3.12 virtual environment (`source .venv/bin/activate` or `.\.venv\Scripts\Activate.ps1`).
3. Run `pip install -r requirements.txt` to sync PyTorch and AI package dependencies.
4. Run `python -m src.server` to launch the AI engine server at `http://localhost:5000`.

---

## System Integration
The AI Brain receives prompt requests routed from `02_Backend`, pulls vector embeddings from `03_Database`, streams real-time tokens to `01_Frontend`, executes system tasks via `07_Automation`, invokes skills registered by `06_Plugins`, and responds to voice inputs from `08_Desktop`.
