# Project Setup Guide

Welcome to the **JARVIS-X** development setup guide. JARVIS-X is an enterprise-grade, Iron Man-inspired AI Operating System designed to deliver real-time multi-modal intelligence, voice interface control, computer vision perception, autonomous task execution, and desktop integration.

This document serves as the official, implementation-ready onboarding manual for developers and system contributors. Following this guide ensures a standardized, reproducible, and robust development environment across Windows, macOS, and Linux platforms.

---

## 1. Purpose

A standardized engineering environment is essential for building a high-performance, real-time AI Operating System. The primary objectives of this setup guide are to:

- **Eliminate Environment Discrepancies**: Prevent "works on my machine" issues by standardizing runtime versions, package managers, system dependencies, and compiler toolchains.
- **Ensure Code Quality & Compliance**: Mandate uniform code style, static analysis, type checking, and automated pre-commit validation.
- **Streamline Onboarding**: Enable new contributors to bootstrap the entire monorepo—including local vector databases, background workers, AI inference pipelines, backend API servers, and frontend dashboards—in under 30 minutes.
- **Enable Multi-OS Parity**: Provide native, verified setup procedures for Windows (PowerShell/WSL2), macOS (Apple Silicon & Intel), and Linux (Ubuntu/Debian/Fedora).

---

## 2. Prerequisites

### 2.1 Hardware Requirements

JARVIS-X includes local AI model execution, vector embedding generation, and real-time audio/video stream processing. Ensure your workstation meets or exceeds the following specifications:

| Resource | Minimum Requirement | Recommended Specification |
| :--- | :--- | :--- |
| **CPU** | 8-core CPU (Intel Core i7 12th Gen, AMD Ryzen 7 5000, or Apple M1 Pro) | 12+ core CPU (Intel i9 13th/14th Gen, AMD Ryzen 9 7000+, Apple M2/M3/M4 Max/Ultra) |
| **RAM** | 16 GB DDR4 / Unified Memory | 32 GB – 64 GB DDR5 / Unified Memory |
| **GPU** | Optional (CPU fallback supported) | NVIDIA RTX 3060/4060+ (8GB+ VRAM, CUDA 12.x) or Apple Silicon GPU |
| **Storage** | 50 GB free SSD storage | 150 GB+ NVMe PCIe 4.0 SSD free space (for AI model weights & Docker volumes) |
| **Network** | Broadband Internet connection | High-speed low-latency connection (for downloading model weights) |

---

### 2.2 Software Requirements

Ensure the following core runtime environments and software tools are installed on your host system:

| Tool | Version Requirement | Purpose | OS Download / Install Command |
| :--- | :--- | :--- | :--- |
| **Git** | `v2.40.0+` | Source code control & submodules | `winget install Git.Git` / `brew install git` |
| **Node.js** | `v20.x` or `v22.x` (LTS) | JavaScript/TypeScript runtime | `nvm install --lts` / `fnm install --lts` |
| **npm** | `v10.x+` | Standard Node package manager | Bundled with Node.js LTS |
| **pnpm** | `v9.x+` | Monorepo fast package manager | `npm install -g pnpm@latest` |
| **Python** | `v3.12+` | AI pipelines, PyTorch & FastAPI | `winget install Python.Python.3.12` / `brew install python@3.12` |
| **VS Code** | Latest Stable | Primary integrated development environment | `winget install Microsoft.VisualStudioCode` / `brew install visual-studio-code` |
| **Docker** | `v26.0+` | Microservice containerization | `winget install Docker.DockerDesktop` / `brew install --cask docker` |
| **Docker Compose** | `v2.26+` | Multi-container stack orchestration | Bundled with Docker Desktop / `docker-compose-plugin` |

---

### 2.3 OS-Specific Pre-Installation Steps

==== "Windows (PowerShell & WSL2)"
    Ensure Windows Subsystem for Linux (WSL2) and Execution Policies are properly configured:
    ```powershell
    # Run PowerShell as Administrator
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

    # Install WSL2 with Ubuntu (Recommended for AI model acceleration)
    wsl --install -d Ubuntu-22.04

    # Enable Developer Mode and Hyper-V features (required for Docker Desktop)
    Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
    ```

==== "macOS (Homebrew)"
    Install Xcode Command Line Tools and Homebrew package manager:
    ```bash
    # Install Xcode CLI tools
    xcode-select --install

    # Install Homebrew (if not already installed)
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Install core tools
    brew install git node@22 pnpm python@3.12 ffmpeg
    ```

==== "Linux (Ubuntu / Debian)"
    Update system packages and install essential build dependencies:
    ```bash
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y build-essential curl git python3.12 python3.12-venv python3.12-dev ffmpeg libssl-dev pkg-config

    # Install Node.js LTS via NodeSource
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt install -y nodejs
    sudo npm install -g pnpm@latest
    ```

---

## 3. Repository Setup

### 3.1 Cloning the Repository

Clone the official JARVIS-X repository using Git. Replace `<repository-url>` with your designated remote URL:

```bash
# Clone the project repository
git clone https://github.com/jarvis-x/jarvis-x.git

# Navigate into the project root directory
cd jarvis-x
```

---

### 3.2 Branch Strategy

JARVIS-X adheres to a structured GitFlow/Trunk Hybrid branching policy:

```
main          ──────────────────────────────────────────────────► (Production Ready Releases)
                ▲                               ▲
release/v1.0   ─┴───────────────────────────────┤
                                                ▲
develop       ───┬──────────────┬───────────────┴───────────────► (Integration Branch)
                 │              │
feature/*     ───┴── JRV-101 ───┴── JRV-102 ───► (Feature Development)
fix/*         ───┴── JRV-201 ──────────────────► (Bug Fixes)
```

- **`main`**: Production-ready, fully tested code releases.
- **`develop`**: Primary integration branch for active development.
- **`feature/<issue-id>-<description>`**: New features (e.g., `feature/JRV-104-voice-streaming`).
- **`fix/<issue-id>-<description>`**: Bug fixes (e.g., `fix/JRV-202-cuda-memory-leak`).
- **`release/vX.Y.Z`**: Release candidate branches for QA and staging verification.

Check out the `develop` branch before initializing your local workspace:

```bash
git checkout develop
git pull origin develop
```

---

### 3.3 Installing Dependencies

JARVIS-X is structured as a high-performance monorepo containing JavaScript/TypeScript packages, Python AI modules, and native Electron bindings.

#### 1. JavaScript & Monorepo Dependencies
Run `pnpm` from the monorepo root to install all workspace dependencies:

```bash
# Clean pnpm workspace installation
pnpm install
```

#### 2. Python Virtual Environment Setup
Set up an isolated Python 3.12 virtual environment for AI and Backend modules:

==== "Windows (PowerShell)"
    ```powershell
    # Navigate to AI module or backend directory
    cd Development/03_AI

    # Create virtual environment
    python -m venv .venv

    # Activate virtual environment
    .\.venv\Scripts\Activate.ps1

    # Upgrade pip and install dependencies
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    ```

==== "macOS & Linux"
    ```bash
    # Navigate to AI module directory
    cd Development/03_AI

    # Create virtual environment
    python3.12 -m venv .venv

    # Activate virtual environment
    source .venv/bin/activate

    # Upgrade pip and install dependencies
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    ```

---

### 3.4 Verifying the Installation

Execute the system pre-flight verification script to ensure all dependencies and runtime paths are correctly wired:

```bash
# Run workspace check script
pnpm run verify
```

Expected verification output:
```
[INFO] Node.js Version: v22.2.0 - OK
[INFO] pnpm Version: v9.1.0 - OK
[INFO] Python Version: 3.12.3 - OK
[INFO] PyTorch CUDA Available: True (NVIDIA GeForce RTX 4080) - OK
[INFO] Docker Engine: v26.1.1 - OK
[SUCCESS] All system prerequisites verified successfully!
```

---

## 4. Recommended VS Code Extensions

For an optimal development experience, install the following recommended VS Code extensions. These extensions enforce code style, speed up debugging, and provide rich IntelliSense across TypeScript, Python, and Docker environments.

| Extension Name | Extension ID | Purpose & Description |
| :--- | :--- | :--- |
| **ESLint** | `dbaeumer.vscode-eslint` | Integrates ESLint into VS Code to highlight static JS/TS code errors in real time. |
| **Prettier - Code Formatter** | `esbenp.prettier-vscode` | Provides opinionated automatic code formatting on save for TS, JS, JSON, and CSS. |
| **Python** | `ms-python.python` | Provides IntelliSense, auto-completion, linting, debugging, and environment selection for Python 3.12. |
| **Docker** | `ms-azuretools.vscode-docker` | Adds container management, image inspection, docker-compose controls, and logs viewing. |
| **GitLens** | `eamodio.gitlens` | Visualizes git authorship inline, code history, commit details, and branch comparisons. |
| **Error Lens** | `usernamehw.errorlens` | Highlights errors and warnings directly on the line where they occur for immediate awareness. |
| **Tailwind CSS IntelliSense** | `bradlc.vscode-tailwindcss` | Offers intelligent autocomplete, syntax highlighting, and linting for Tailwind CSS classes. |
| **Markdown All in One** | `yzhang.markdown-all-in-one` | Streamlines writing project documentation, spec updates, live previews, and TOC generation. |

### VS Code Workspace Configuration Snippet

Create or update `.vscode/extensions.json` in the root of your workspace:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "ms-azuretools.vscode-docker",
    "eamodio.gitlens",
    "usernamehw.errorlens",
    "bradlc.vscode-tailwindcss",
    "yzhang.markdown-all-in-one"
  ]
}
```

---

## 5. Environment Configuration

### 5.1 Environment Configuration Files

JARVIS-X utilizes a multi-tiered configuration strategy to isolate sensitive secrets and environment-specific settings.

```
Development/
├── .env.example        # Version-controlled template containing default keys and dummy placeholders
├── .env.development    # Local development default variables (uncommitted secrets omitted)
├── .env.test           # Automated test suite variables
└── .env.local          # Local uncommitted developer overrides (ignored by Git)
```

> [!IMPORTANT]
> Never commit actual credentials, API keys, or private SSH keys into Git. `.env.local` is added to `.gitignore` by default.

---

### 5.2 Environment Variables Breakdown

| Environment Variable | Category | Example / Default Value | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Application | `development` | Defines runtime execution environment (`development`, `staging`, `production`). |
| `PORT` | Networking | `8000` | Port for the primary Backend API service. |
| `JARVIS_OS_MODE` | System | `DESKTOP_OVERLAY` | Execution mode (`DESKTOP_OVERLAY`, `WEB_HEADLESS`, `SERVER_DAEMON`). |
| `DATABASE_URL` | Storage | `postgresql://jarvis:secret@localhost:5432/jarvis_db` | Primary PostgreSQL database connection string. |
| `REDIS_URL` | Storage / Cache | `redis://localhost:6379/0` | Redis caching and Pub/Sub event bus URL. |
| `VECTOR_DB_URL` | AI Storage | `http://localhost:6333` | Vector Database endpoint (Qdrant / Milvus / pgvector). |
| `OPENAI_API_KEY` | AI Credentials | `sk-proj-xxxx...` | OpenAI API Key for fallback cloud LLM execution. |
| `ANTHROPIC_API_KEY` | AI Credentials | `sk-ant-xxxx...` | Anthropic Claude API Key for complex reasoning tasks. |
| `LOCAL_LLM_ENDPOINT` | AI Service | `http://localhost:11434` | Endpoint for local Ollama / vLLM local model inference engine. |
| `WHISPER_MODEL_PATH` | Speech AI | `./models/whisper-large-v3.pt` | Path or model identifier for local Whisper speech recognition. |
| `TTS_ENGINE` | Speech AI | `piper` | Local text-to-speech engine (`piper`, `coqui`, `elevenlabs`). |
| `VISION_DEVICE` | Vision AI | `cuda:0` | Hardware device target for vision pipelines (`cuda:0`, `mps`, `cpu`). |
| `LOG_LEVEL` | Logging | `debug` | Logging level verbosity (`trace`, `debug`, `info`, `warn`, `error`). |

---

### 5.3 Complete `.env.example` Template

Copy `.env.example` to `.env.local` before launching services:

```bash
cp .env.example .env.local
```

```env
# ==============================================================================
# JARVIS-X AI OPERATING SYSTEM - ENVIRONMENT CONFIGURATION TEMPLATE
# ==============================================================================

# --- System & Application Settings ---
NODE_ENV=development
PORT=8000
HOST=0.0.0.0
JARVIS_OS_MODE=DESKTOP_OVERLAY
LOG_LEVEL=debug
SECRET_KEY=change-this-to-a-secure-random-32-character-string

# --- Database & Cache Connection Strings ---
DATABASE_URL=postgresql://jarvis_user:jarvis_dev_pass@localhost:5432/jarvis_db?sslmode=disable
REDIS_URL=redis://localhost:6379/0
VECTOR_DB_TYPE=qdrant
VECTOR_DB_URL=http://localhost:6333
VECTOR_DB_API_KEY=

# --- AI Models & LLM Services ---
DEFAULT_LLM_PROVIDER=local
LOCAL_LLM_ENDPOINT=http://localhost:11434
LOCAL_LLM_MODEL=llama3:8b-instruct-q8_0

# Cloud Fallback Keys (Optional)
OPENAI_API_KEY=sk-placeholder-openai-key-here
ANTHROPIC_API_KEY=sk-placeholder-anthropic-key-here

# --- Speech & Voice Subsystem ---
SPEECH_RECOGNITION_ENGINE=whisper
WHISPER_MODEL_SIZE=medium.en
WHISPER_DEVICE=cuda
TTS_ENGINE=piper
TTS_VOICE_ID=en_US-lessac-medium

# --- Vision & Spatial Perception ---
VISION_ENABLED=true
VISION_CAMERA_INDEX=0
VISION_DEVICE=cuda:0
OBJECT_DETECTION_MODEL=yolov8x.pt

# --- Desktop Shell & Security ---
ENABLE_NATIVE_KEYBOARD_HOOKS=true
ALLOW_SYSTEM_COMMAND_EXECUTION=true
JWT_SECRET_KEY=super-secret-jwt-token-key-for-jarvis-x
```

---

## 6. Project Structure

The `Development/` folder contains the full codebase for the JARVIS-X AI Operating System, modularized cleanly into dedicated functional tiers:

```
Development/
├── 00_Setup/           # Developer onboarding guides, environment scripts, setup validation tools
├── 01_Frontend/        # Next.js / Vite React desktop UI, glassmorphic widgets, HUD components
├── 02_Backend/         # FastAPI / Node.js API server, IPC controllers, system event bus
├── 03_AI/              # AI Brain, PyTorch pipelines, local LLM orchestrator, RAG system
├── 04_Database/        # Database schemas, migrations (Prisma/Alembic), vector indexes
├── 05_APIs/            # OpenAPI specifications, gRPC protos, external tool integrations
├── 06_Plugins/         # Plugin architecture, custom skill extensions, third-party integrations
├── 07_Automation/      # Task queues, background workers, automation scripts (BullMQ/Celery)
├── 08_Desktop/         # Native Electron shell, OS window manager overlay, hardware IPC
├── 09_Testing/         # End-to-End test suites (Playwright), unit tests, benchmark datasets
└── 10_Deployment/      # Dockerfiles, docker-compose stacks, Helm charts, CI/CD workflows
```

### Top-Level Directory Breakdown

- **`00_Setup/`**: Contains this setup guide, installation scripts, environment verification utilities, and workspace bootstrap manifests.
- **`01_Frontend/`**: Houses the user interface dashboard. Features real-time audio visualizers, Iron Man HUD elements, system performance telemetry graphs, and settings panels.
- **`02_Backend/`**: Core API server exposing WebSocket and REST endpoints for system control, audio stream ingestion, and inter-process communication (IPC).
- **`03_AI/`**: The core intelligence engine. Contains prompt pipelines, local LLM wrappers, speech recognition (Whisper), text-to-speech synthesis (Piper/Coqui), computer vision models, and memory retrieval (RAG).
- **`04_Database/`**: Holds database models, migrations, and seed scripts for PostgreSQL, Redis, and Qdrant vector databases.
- **`05_APIs/`**: Defines contract specifications (OpenAPI 3.0 / Protocol Buffers) and client SDK wrappers for external APIs (e.g., weather, smart home, financial data).
- **`06_Plugins/`**: Modular plugin system enabling developers to add custom capabilities (e.g., controlling Spotify, executing local terminal commands, querying web search).
- **`07_Automation/`**: Background execution engine for scheduling cron jobs, event-triggered reactive workflows, and asynchronous task execution queues.
- **`08_Desktop/`**: Native desktop shell wrapper (Electron/Tauri) providing frameless overlay windows, global hotkeys, hardware camera/microphone access, and native OS APIs.
- **`09_Testing/`**: Automated quality assurance infrastructure including Playwright E2E UI tests, pytest backend unit tests, and performance benchmark suites.
- **`10_Deployment/`**: Infrastructure-as-code manifests including multi-container Docker Compose files, Kubernetes manifests, and GitHub Actions CI/CD pipelines.

---

## 7. Development Workflow

### 7.1 Creating a Feature Branch

Always create a new branch from `develop` before starting work on a new feature or bug fix:

```bash
# Ensure develop is up to date
git checkout develop
git pull origin develop

# Create and checkout feature branch
git checkout -b feature/JRV-105-voice-activation
```

---

### 7.2 Coding Standards

All code committed to JARVIS-X must adhere to the following standards:

- **TypeScript / JavaScript**:
  - Strict mode enabled (`"strict": true` in `tsconfig.json`).
  - No usage of `any` types without explicit review and approval.
  - Asynchronous code must use `async/await` pattern (avoid unhandled Promise rejections).
  - Component names must use PascalCase (e.g., `VoiceVisualizer.tsx`).

- **Python**:
  - Adhere to **PEP 8** guidelines.
  - Mandatory type hinting for all function parameters and return types:
    ```python
    def process_audio_stream(buffer: bytes, sample_rate: int = 16000) -> str:
        ...
    ```
  - Standardized docstring format (Google format).

---

### 7.3 Commit Conventions

Commit messages must follow the **Conventional Commits** standard:

$$\text{Format: } \texttt{<type>(<scope>): <short description>}$$

**Types**:
- `feat`: A new user-facing feature.
- `fix`: A bug fix.
- `docs`: Documentation updates only.
- `style`: Code style changes (formatting, missing semi-colons).
- `refactor`: Code changes that neither fix a bug nor add a feature.
- `test`: Adding or correcting tests.
- `chore`: Maintenance tasks, dependency upgrades, build config updates.

**Examples**:
```bash
git commit -m "feat(voice): implement streaming Whisper audio transcription"
git commit -m "fix(desktop): resolve window overlay transparency flickering on Windows"
git commit -m "docs(setup): update Python installation prerequisites for macOS"
```

---

### 7.4 Pull Requests & Code Reviews

1. **Push Branch**: Push your feature branch to GitHub:
   ```bash
   git push origin feature/JRV-105-voice-activation
   ```
2. **Open Pull Request**: Open a PR targeting `develop`. Fill out the standard PR template fully.
3. **Automated CI Checks**: Ensure all GitHub Actions status checks pass (Linting, Build, Unit Tests).
4. **Code Review**: Obtain approval from at least **2 core maintainers**. Address review comments promptly.
5. **Squash and Merge**: Once approved, merge using "Squash and Merge".

---

## 8. Local Development

You can run services individually for targeted development or launch the full stack concurrently.

### 8.1 Step-by-Step Service Startup

#### 1. Database & Cache Services (Docker)
Start the background infrastructure containers first:

```bash
# Navigate to Deployment directory
cd Development/10_Deployment

# Spin up Postgres, Redis, and Vector DB in background
docker compose up -d postgres redis vector-db
```

#### 2. Backend API Server (Node.js / FastAPI)
In a new terminal window:

```bash
cd Development/02_Backend
pnpm dev
# Server running at: http://localhost:8000
```

#### 3. AI Inference Service (Python)
In a new terminal window with your virtual environment activated:

```bash
cd Development/03_AI
source .venv/bin/activate  # Or .\.venv\Scripts\Activate.ps1 on Windows
python -m src.server
# AI Service running at: http://localhost:5000
```

#### 4. Frontend Dashboard (Next.js / Vite)
In a new terminal window:

```bash
cd Development/01_Frontend
pnpm dev
# Frontend UI accessible at: http://localhost:3000
```

#### 5. Desktop Electron Shell
In a new terminal window:

```bash
cd Development/08_Desktop
pnpm dev
# Native Electron Overlay window launches attached to local backend
```

---

### 8.2 Full-Stack Monorepo Startup Command

Alternatively, start all services simultaneously from the monorepo root using `pnpm`:

```bash
# Launch all microservices in parallel with concurrent logs output
pnpm run dev
```

---

## 9. Docker Development

Docker Compose provides a complete, isolated environment mirroring production architecture.

### 9.1 Container Network Architecture

```
                  ┌─────────────────────────────────────────┐
                  │          JARVIS-X Docker Network        │
                  │             (jarvis-network)            │
                  └────┬──────────────────────────────┬─────┘
                       │                              │
          ┌────────────┴────────────┐    ┌────────────┴────────────┐
          │     jarvis-frontend     │    │     jarvis-backend      │
          │      Port: 3000         │    │      Port: 8000        │
          └────────────┬────────────┘    └────────────┬────────────┘
                       │                              │
          ┌────────────┴────────────┐    ┌────────────┴────────────┐
          │    jarvis-ai-service    │    │      postgres-db        │
          │      Port: 5000         │    │      Port: 5432        │
          └────────────┬────────────┘    └────────────┬────────────┘
                       │                              │
          ┌────────────┴────────────┐    ┌────────────┴────────────┐
          │      redis-cache        │    │    qdrant-vector-db    │
          │      Port: 6379         │    │      Port: 6333        │
          └─────────────────────────┘    └─────────────────────────┘
```

---

### 9.2 Useful Docker Management Commands

```bash
# Build all container images from scratch
docker compose -f Development/10_Deployment/docker-compose.yml build --no-cache

# Start all services in detached mode
docker compose -f Development/10_Deployment/docker-compose.yml up -d

# View live streaming logs for all containers
docker compose -f Development/10_Deployment/docker-compose.yml logs -f

# View live logs for a specific service (e.g., AI service)
docker compose -f Development/10_Deployment/docker-compose.yml logs -f ai-service

# Execute interactive shell inside backend container
docker compose -f Development/10_Deployment/docker-compose.yml exec backend sh

# Stop all containers and remove networks
docker compose -f Development/10_Deployment/docker-compose.yml down

# Stop all containers and wipe persistent data volumes (Full reset)
docker compose -f Development/10_Deployment/docker-compose.yml down -v
```

---

## 10. Code Quality

JARVIS-X enforces automated code quality controls via linters, formatters, type checkers, and git hooks.

### 10.1 Formatting and Linting Commands

Run formatting and linting tasks across the entire monorepo:

```bash
# Format JS/TS code with Prettier
pnpm run format

# Format Python code with Black & Ruff
pnpm run format:py

# Lint JS/TS files with ESLint
pnpm run lint

# Lint Python files with Ruff
pnpm run lint:py
```

---

### 10.2 Type Checking & Testing

```bash
# Run TypeScript type check across all frontend & backend packages
pnpm run typecheck

# Run Python static type verification with MyPy
pnpm run typecheck:py

# Execute JS/TS unit tests (Vitest)
pnpm run test

# Execute Python AI & backend tests (pytest)
pnpm run test:py
```

---

### 10.3 Pre-commit Hooks (Husky)

JARVIS-X uses **Husky** and **lint-staged** to automatically intercept commits and run linting and type checks on modified files:

```bash
# Manually install or re-initialize Husky pre-commit hooks
pnpm run prepare
```

When committing code, Husky will run the following sequence automatically:
1. `prettier --write` on modified JS/TS/JSON/CSS files.
2. `eslint --fix` on modified JS/TS files.
3. `black` and `ruff` on modified Python files.
4. `tsc --noEmit` to verify type safety.

If any check fails, the commit is halted until errors are resolved.

---

## 11. Debugging

### 11.1 VS Code Launch Configuration

Save the following `.vscode/launch.json` file in your repository root to enable multi-target debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend API",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["--filter", "backend", "dev"],
      "console": "integratedTerminal"
    },
    {
      "name": "Debug AI Service (Python)",
      "type": "debugpy",
      "request": "launch",
      "module": "uvicorn",
      "args": ["src.server:app", "--reload", "--port", "5000"],
      "jinja": true,
      "cwd": "${workspaceFolder}/Development/03_AI"
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Frontend (Chrome)",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/Development/01_Frontend"
    },
    {
      "name": "Debug Electron Main Process",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/Development/08_Desktop",
      "runtimeExecutable": "${workspaceFolder}/Development/node_modules/.bin/electron",
      "windows": {
        "runtimeExecutable": "${workspaceFolder}/Development/node_modules/.bin/electron.cmd"
      },
      "args": ["."]
    }
  ]
}
```

---

### 11.2 Debugging Specific Modules

- **Frontend (React / Next.js)**: Open Chrome DevTools (`F12`), install the React Developer Tools extension, and set breakpoints directly inside VS Code using the Chrome Debugger launch config.
- **Backend (Node.js / FastAPI)**: Attach the VS Code debugger to line numbers in controller logic. Use `LOG_LEVEL=debug` to output SQL query traces and WebSocket frame details.
- **Electron Shell**: Access the Renderer DevTools using `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS). Debug main process IPC events via VS Code's "Debug Electron Main Process" configuration.
- **AI Modules**: Set `LOG_LEVEL=debug` in `.env.local` to inspect raw prompt inputs, LLM token streaming responses, and PyTorch CUDA tensor memory allocations. Monitor GPU VRAM using `nvidia-smi -l 1`.

---

## 12. Common Issues & Troubleshooting

### 12.1 Dependency & Node Version Conflicts

**Symptom**: `pnpm install` fails with lockfile mismatches or `ERR_PNPM_PEER_DEP_ISSUES`.

**Solution**:
```bash
# Clear pnpm store cache and reinstall
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

### 12.2 Python Virtual Environment Errors

**Symptom**: `ModuleNotFoundError: No module named 'torch'` or PyTorch CUDA failure.

**Solution**:
Reinstall PyTorch with explicit CUDA 12.1 wheel index:
```bash
pip install --force-reinstall torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

---

### 12.3 Docker Port Conflicts

**Symptom**: `Error starting userland proxy: listen tcp 0.0.0.0:5432: bind: address already in use`.

**Solution**:
Identify and terminate the process occupying the port:

==== "Windows (PowerShell)"
    ```powershell
    # Find Process ID on port 5432
    Get-Process -Id (Get-NetTCPConnection -LocalPort 5432).OwningProcess

    # Stop local PostgreSQL service if running natively
    Stop-Service postgresql*
    ```

==== "macOS & Linux"
    ```bash
    # Identify process on port 5432
    sudo lsof -i :5432

    # Kill process by PID
    sudo kill -9 <PID>
    ```

---

### 12.4 Electron Native Module Compilation Failures

**Symptom**: `Error: The module '...' was compiled against a different Node.js version`.

**Solution**:
Rebuild native C++ modules against Electron's Node runtime version:
```bash
cd Development/08_Desktop
pnpm exec electron-rebuild
```

---

## 13. Best Practices

To ensure long-term codebase maintainability, security, and scalability, follow these core tenets:

1. **Modular Architecture**: Maintain strict separation of concerns between Desktop IPC, API Backend, AI inference, and Frontend rendering.
2. **Defensive Error Handling**: Never allow AI model timeouts or audio stream dropouts to crash the core desktop app. Wrap IPC calls in try/catch blocks with graceful UI fallback state.
3. **Zero Secrets in Source Code**: Use `.env.local` for local secrets and secret managers (HashiCorp Vault / AWS Secrets Manager) for staging and production deployments.
4. **Performance Budgets**: Audio perception pipeline latency must remain under 300ms. Keep frontend bundle sizes optimized using dynamic imports.
5. **Comprehensive Logging**: Log all system events with structured JSON formatting (`logger.info({ event: 'voice_command_received', latency_ms: 120 })`).

---

## 14. Acceptance Criteria

Your development environment setup is complete when all items in the following checklist pass successfully:

- [ ] **Prerequisites Verified**: Node.js (`v20+`/`v22+`), Python (`3.12+`), pnpm (`9+`), Docker (`26+`), and Git installed and reported valid via `pnpm run verify`.
- [ ] **Repository Cloned**: Monorepo cloned locally on the `develop` branch.
- [ ] **Dependencies Installed**: `pnpm install` completes cleanly with 0 errors. Python virtual environment activated and `requirements.txt` installed.
- [ ] **Environment Configured**: `.env.local` created from `.env.example` with valid key placeholders.
- [ ] **Database Stack Online**: PostgreSQL, Redis, and Vector DB containers running healthy via `docker compose ps`.
- [ ] **Services Launch Successfully**: Frontend (port `3000`), Backend (port `8000`), and AI Service (port `5000`) start without unhandled exceptions.
- [ ] **Healthcheck Passing**: Navigating to `http://localhost:8000/api/health` returns `{"status": "ok", "system": "JARVIS-X"}`.
- [ ] **Code Quality Verified**: `pnpm run lint` and `pnpm run typecheck` execute with zero errors.

---

## 15. Conclusion

Following this Project Setup Guide ensures a consistent, robust, and reproducible development environment for all JARVIS-X contributors. By standardizing our runtime tools, environment configurations, coding guidelines, and verification procedures, we ensure seamless collaboration and accelerated development of the ultimate AI Operating System.

If you encounter any issues not covered in the troubleshooting section, please open an issue on the repository issue tracker or reach out on the official JARVIS-X developer Discord/Slack channels. Happy coding!
