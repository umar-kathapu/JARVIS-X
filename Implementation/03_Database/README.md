# 03_Database

## Purpose
The `03_Database` folder manages the data persistence architecture for JARVIS-X. It houses PostgreSQL 16 relational database schemas, Prisma ORM migration scripts, Redis in-memory cache definitions, and `pgvector` / Qdrant vector memory embedding indexes.

---

## Responsibilities
- **Relational Data Persistence**: Modeling users, conversation sessions, messages, plugins, automations, and audit logs.
- **Type-Safe ORM Client**: Generating TypeScript database models via Prisma ORM (`prisma-client-js`).
- **Semantic Vector Storage**: Storing high-dimensional vector embeddings for sub-30ms RAG memory search.
- **In-Memory Caching**: Providing low-latency Redis caching and Pub/Sub event bus state management.
- **Schema Migrations**: Versioning database structural changes using Prisma Migrate scripts.

---

## Files Created in this Folder
- `prisma/schema.prisma`: Master relational & vector data model specification.
- `prisma/migrations/`: Timestamped SQL schema migration history.
- `src/client.ts`: Singleton instance exporter for `PrismaClient`.
- `src/redis.ts`: Redis client configuration and connection pool manager.
- `src/vector-store.ts`: HNSW vector cosine similarity search wrappers (`vector_cosine_ops`).
- `src/seed.ts`: Database seed script for development and testing environments.

---

## Development Workflow
1. Navigate to `Implementation/03_Database/`.
2. Ensure local PostgreSQL and Redis containers are active (`docker compose up -d postgres redis`).
3. Run `pnpm exec prisma migrate dev --name <migration_name>` to apply schema updates.
4. Run `pnpm exec prisma studio` to inspect database records in visual GUI.

---

## System Integration
The database tier underpins `02_Backend` for relational user data and auth verification, powers `04_AI` with vector RAG semantic memory retrieval, stores `06_Plugins` settings, and tracks `07_Automation` job queue state.
