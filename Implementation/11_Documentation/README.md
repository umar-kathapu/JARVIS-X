# 11_Documentation

## Purpose
The `11_Documentation` folder serves as the central knowledge repository and developer reference library for JARVIS-X. It houses architectural specifications, onboarding guides, API references, database schemas, plugin developer manuals, and system design diagrams.

---

## Responsibilities
- **Architectural Specifications**: Maintaining master system specs, data flow diagrams, and subsystem design documents.
- **Developer Onboarding Guides**: Storing implementation guides for Frontend, Backend, AI, Database, APIs, Plugins, Automation, Desktop, Testing, and Deployment.
- **API Reference Manuals**: Publishing rendered OpenAPI HTML documentation, WebSocket message catalogs, and IPC event indexes.
- **Design System Guidelines**: Documenting glassmorphic design tokens, color palettes (`#050811`, `#00F0FF`), and atomic UI component guidelines.
- **Security & Compliance Docs**: Outlining sandbox boundaries, permission prompt policies, and vulnerability response playbooks.

---

## Files Created in this Folder
- `architecture/`: High-level system architecture diagrams and subsystem specifications.
- `guides/`: Complete development guides (`PROJECT_SETUP_GUIDE.md`, `FRONTEND_DEVELOPMENT_GUIDE.md`, `BACKEND_DEVELOPMENT_GUIDE.md`, etc.).
- `api-reference/`: Rendered API endpoints and WebSocket protocol documentation.
- `database/`: Database entity-relationship (ER) diagrams and Prisma schema documentation.
- `plugins/`: Plugin SDK development reference and manifest specifications.
- `security/`: Threat models, security policies, and sandbox guidelines.

---

## Development Workflow
1. Navigate to `Implementation/11_Documentation/`.
2. Update or add Markdown documentation files using standard GitHub Markdown.
3. Run `pnpm run docs:build` to validate internal markdown links and generate static documentation site.
4. Preview documentation pages locally before committing updates.

---

## System Integration
This folder documents all subdirectories across the `Implementation` monorepo (`00_Project_Initialization` through `10_Deployment`), serving as the authoritative reference for developers, open-source contributors, and automated documentation generators.
