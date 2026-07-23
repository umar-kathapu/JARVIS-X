# 00_Project_Initialization

## Purpose
The `00_Project_Initialization` folder serves as the central bootstrapping directory for the JARVIS-X project. It contains workspace initialization manifests, global package configurations, monorepo setup scripts, environment templates, and repository verification tools required to establish a standardized engineering environment across Windows, macOS, and Linux platforms.

---

## Responsibilities
- **Monorepo Setup**: Managing `pnpm-workspace.yaml`, `package.json`, and workspace root dependencies.
- **Environment Verification**: Executing pre-flight environment checks to validate Node.js, pnpm, Python, PyTorch, and Docker versions.
- **Environment Templates**: Maintaining global `.env.example` templates and configuration defaults.
- **Developer Tooling**: Providing bootstrap installation scripts for local developer workstations.

---

## Files Created in this Folder
- `package.json`: Root monorepo workspace configuration and global scripts.
- `pnpm-workspace.yaml`: Monorepo package directory definitions.
- `.env.example`: Master environment variable configuration template.
- `verify-environment.js`: Pre-flight verification script for checking system runtime tools.
- `bootstrap.sh` / `bootstrap.ps1`: One-click environment bootstrap scripts for Unix and Windows.

---

## Development Workflow
1. Clone the repository and navigate into the `Implementation/` root.
2. Run `pnpm run verify` to validate host prerequisites (Node.js LTS, pnpm, Python 3.12+, Docker).
3. Execute `cp .env.example .env.local` to populate local environment variables.
4. Run `pnpm install` from the root directory to install all monorepo dependencies.

---

## System Integration
This folder integrates directly with all other `Implementation` subdirectories by establishing the shared monorepo workspace rules, standardizing runtime versions, and supplying root execution scripts (`pnpm dev`, `pnpm build`, `pnpm test`) consumed by CI/CD pipelines and local developers.
