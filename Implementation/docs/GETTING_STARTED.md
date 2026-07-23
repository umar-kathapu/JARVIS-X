# JARVIS-X Developer Quickstart Guide

## Prerequisites
1. Node.js `v18.0.0` or later
2. pnpm `v8.0.0` or later
3. Docker Desktop

## Workspace Setup
```bash
# 1. Install dependencies
pnpm install

# 2. Check environment config
pnpm check-env

# 3. Start PostgreSQL Database
docker compose up -d postgres

# 4. Generate Prisma Client
pnpm prisma:generate

# 5. Migrate Database Schema
pnpm prisma:migrate

# 6. Start Development Mode
pnpm dev
```
