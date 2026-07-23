# PostgreSQL & Prisma Setup Guide

## Overview
The backend application utilizes **Prisma ORM** connecting to a **PostgreSQL 16** container service.

## Database Commands
```bash
# Start DB container
docker compose up -d postgres

# Run Prisma schema validation
pnpm --filter @jarvis-x/backend exec prisma validate

# Push schema changes to development database
pnpm prisma:migrate

# Open Prisma Studio GUI
pnpm prisma:studio
```

## Schema Entities
- `User`: Admin, Operator, System, Guest profiles.
- `Session`: Active JWT authentication sessions.
- `AgentTask`: Task queue for autonomous AI subagents.
- `SystemLog`: Enterprise structured logging entries.
- `PluginConfig`: Dynamic feature flag and plugin configurations.
