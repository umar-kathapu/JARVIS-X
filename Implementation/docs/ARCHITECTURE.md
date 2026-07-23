# JARVIS-X Monorepo Architecture

## Overview
JARVIS-X is an enterprise-grade autonomous AI assistant system built as a TypeScript monorepo using `pnpm workspaces` and `TurboRepo`.

```
                    +--------------------------------+
                    |     JARVIS-X Desktop (App)     |
                    |     (Electron + React + UI)    |
                    +---------------+----------------+
                                    |
                                    | REST / IPC
                                    v
                    +---------------+----------------+
                    |      JARVIS-X Backend (App)    |
                    |     (Express + Prisma Client)  |
                    +---------------+----------------+
                                    |
                                    | SQL Queries
                                    v
                    +---------------+----------------+
                    |    PostgreSQL Database (Docker) |
                    +--------------------------------+
```

## Packages Architecture
- `@jarvis-x/types`: Centralized TypeScript interfaces for IPC, Users, Tasks, and API payloads.
- `@jarvis-x/shared`: Shared constants (IPC channels, HTTP status) and Zod validation schemas.
- `@jarvis-x/utils`: Enterprise logging, async retry policies, crypto helpers, and date formatting.
- `@jarvis-x/ui`: Modular React component library styled with Tailwind CSS and animated with Framer Motion.
- `@jarvis-x/configs`: Workspace preset configurations for ESLint, Prettier, and TypeScript.
