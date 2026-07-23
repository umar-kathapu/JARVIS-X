# Database Development Guide

Welcome to the **JARVIS-X** Database Development Guide. JARVIS-X is an enterprise-grade, Iron Man-inspired AI Operating System designed to deliver real-time multi-modal intelligence, voice interface control, computer vision perception, autonomous task execution, and desktop integration.

This document serves as the official, implementation-ready architectural manual for designing, developing, securing, migrating, and scaling the data persistence and vector retrieval layer of JARVIS-X.

---

## 1. Purpose

The database layer of JARVIS-X serves as the bedrock for system state, user personalization, conversation history, vector semantic memory, and background automation workflows. Its primary responsibilities include:

- **Relational Persistence**: Storing user profiles, access control policies, plugin configurations, workflow automation definitions, and system audit logs.
- **High-Speed Caching & Event Messaging**: Providing low-latency in-memory state storage, session management, and pub/sub message broadcasting via Redis.
- **Semantic Vector Storage**: Storing high-dimensional vector embeddings to enable sub-50ms RAG (Retrieval-Augmented Generation) memory retrieval.
- **Data Integrity & Security**: Guaranteeing ACID transactional safety, strict foreign key constraints, encryption at rest/transit, and automated backup point-in-time recovery.

---

## 2. Database Vision

The vision for the JARVIS-X data architecture is a hybrid relational-vector storage platform capable of supporting real-time local desktop interaction while scaling to enterprise multi-tenant deployments.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      JARVIS-X DATA PLATFORM VISION                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌───────────────────┐    ┌───────────────────┐    ┌────────────────┐  │
│   │ RELATIONAL DATA   │    │  VECTOR MEMORY    │    │  CACHE & BUS   │  │
│   │ PostgreSQL 16     │    │  pgvector / Qdrant│    │  Redis 7.x     │  │
│   │ Prisma ORM        │    │  HNSW Index       │    │  Pub/Sub       │  │
│   └─────────┬─────────┘    └─────────┬─────────┘    └───────┬────────┘  │
│             │                        │                      │           │
│             └────────────────────────┼──────────────────────┘           │
│                                      │                                  │
│                   ┌──────────────────▼──────────────────┐               │
│                   │      ENTERPRISE DATA SECURITY       │               │
│                   │ AES-256 | TLS 1.3 | RBAC | WAL Backup │               │
│                   └─────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Tenets

1. **Type-Safe Data Access**: End-to-end type safety from Prisma database models to Fastify API TypeScript controllers.
2. **Sub-10ms Cache Hits**: Redis caching tier to offload frequent system telemetry and active session queries.
3. **High-Performance Vector Indexing**: HNSW (Hierarchical Navigable Small World) vector indexing for fast semantic similarity search over millions of memory vectors.

---

## 3. Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATABASE TECH STACK                           │
├───────────────┬──────────────────────────┬──────────────────────────────┤
│ Component     │ Technology               │ Purpose & Role               │
├───────────────┼──────────────────────────┼──────────────────────────────┤
│ Primary DB    │ PostgreSQL 16            │ Relational transactional data│
│ ORM           │ Prisma ORM (v5.x)        │ Type-safe data client & schema│
│ Cache & Bus   │ Redis 7.x                │ Caching, session, Pub/Sub    │
│ Vector Index  │ pgvector / Qdrant        │ Vector embeddings & RAG search│
│ Container     │ Docker & Docker Compose  │ Local containerized stack    │
│ Migrations    │ Prisma Migrate           │ Automated versioned SQL migrations│
└───────────────┴──────────────────────────┴──────────────────────────────┘
```

---

## 4. Database Architecture

JARVIS-X combines relational storage, in-memory caching, and vector indexing within a unified data pipeline:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATABASE SYSTEM ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   BACKEND API & AI ENGINE                                               │
│         │                                                               │
│         ├───► [ L1/L2 CACHE LOOKUP ] ──────► Redis 7.x (Port 6379)      │
│         │                                                               │
│         ├───► [ RELATIONAL TRANSACTION ] ──► PostgreSQL 16 (Port 5432)  │
│         │                                                               │
│         └───► [ VECTOR RAG SEARCH ] ────────► pgvector / Qdrant (6333) │
│                                                                         │
│   STORAGE & BACKUP                                                      │
│         │                                                               │
│         ├───► Write-Ahead Logs (WAL) ─────► Incremental Backup Storage │
│         └───► Encrypted Snapshots ────────► S3 / Local Backup Vault     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Schema Design Principles

All database schemas in JARVIS-X adhere to strict relational design standards:

- **Third Normal Form (3NF)**: Tables are normalized to reduce data redundancy and update anomalies.
- **Explicit Foreign Key Constraints**: All relationships use explicit foreign keys with declared `ON DELETE` rules (`CASCADE`, `SET NULL`, `RESTRICT`).
- **Surrogate Primary Keys**: UUIDv4 primary keys (`@default(uuid())`) are standard across all tables for distributed compatibility.
- **Strict Data Integrity**: Non-nullable columns where data is required, CHECK constraints for bounded ranges, and UNIQUE indexes for logical keys.

---

## 6. Core Data Models

The Prisma schema definition (`Development/04_Database/prisma/schema.prisma`) models the primary entities of JARVIS-X:

```prisma
// Development/04_Database/prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  DEVELOPER
  OPERATOR
  GUEST
}

enum MessageRole {
  SYSTEM
  USER
  ASSISTANT
  TOOL
}

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  passwordHash  String
  name          String
  role          Role           @default(OPERATOR)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  conversations Conversation[]
  memories      Memory[]
  apiKeys       ApiKey[]
  auditLogs     AuditLog[]

  @@map("users")
}

model Conversation {
  id        String    @id @default(uuid())
  userId    String
  title     String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  Message[]

  @@map("conversations")
}

model Message {
  id             String       @id @default(uuid())
  conversationId String
  role           MessageRole
  content        String
  tokens         Int          @default(0)
  metadata       Json?
  createdAt      DateTime     @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@map("messages")
}

model Memory {
  id         String   @id @default(uuid())
  userId     String
  content    String
  embedding  Unsupported("vector(1536)")?
  category   String   @default("general")
  importance Float    @default(0.5)
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("memories")
}

model Plugin {
  id          String   @id @default(uuid())
  name        String   @unique
  version     String
  enabled     bool     @default(true)
  permissions String[]
  config      Json?
  createdAt   DateTime @default(now())

  @@map("plugins")
}

model Automation {
  id         String   @id @default(uuid())
  name       String
  cronSpec   String?
  eventTrigger String?
  actionScript String
  enabled    Boolean  @default(true)
  createdAt  DateTime @default(now())

  @@map("automations")
}

model ApiKey {
  id        String    @id @default(uuid())
  userId    String
  keyHash   String    @unique
  name      String
  expiresAt DateTime?
  createdAt DateTime  @default(now())
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("api_keys")
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  action    String
  resource  String
  ipAddress String
  createdAt DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("audit_logs")
}
```

---

## 7. Vector Storage & Semantic Search

Vector search enables JARVIS-X to perform semantic RAG memory retrieval using `pgvector` or `Qdrant`.

### HNSW Index Definition (SQL Migration snippet)

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create HNSW Index on Memory embedding vector column for fast cosine distance search
CREATE INDEX IF NOT EXISTS idx_memories_embedding_hnsw 
ON memories 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);
```

### Semantic Cosine Similarity Query Example

```sql
-- Similarity Search SQL Query: Find top 5 most relevant memories
SELECT id, content, 1 - (embedding <=> $1::vector) AS similarity_score
FROM memories
WHERE user_id = $2 AND (1 - (embedding <=> $1::vector)) > 0.75
ORDER BY embedding <=> $1::vector ASC
LIMIT 5;
```

---

## 8. Database Operations

### 8.1 Transaction Management (Prisma)

Atomic multi-table writes must use explicit Prisma transactions:

```typescript
import { prisma } from '../database/client';

export async function createConversationWithMessage(
  userId: string,
  title: string,
  initialMessage: string
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Create Conversation
    const conversation = await tx.conversation.create({
      data: { userId, title },
    });

    // 2. Create Initial User Message
    const message = await tx.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: initialMessage,
      },
    });

    return { conversation, message };
  });
}
```

---

## 9. Performance Optimization

1. **Index Strategy**:
   - Primary B-Tree indexes on foreign keys (`userId`, `conversationId`).
   - Composite index on `(userId, createdAt DESC)` for conversation list ordering.
   - HNSW index on vector embedding columns for sub-20ms semantic search.
2. **Connection Pooling**: Configure pgBouncer or Prisma Client connection limits (`connection_limit=20`) to prevent database connection exhaustion.
3. **Query Optimization**: Use `EXPLAIN ANALYZE` on complex queries to ensure index hits; select only required columns using Prisma `select` masks.

---

## 10. Database Security

- **Encryption at Rest**: PostgreSQL data directories encrypted via AES-256 volume storage.
- **Encryption in Transit**: Require SSL/TLS (`sslmode=verify-full`) for all database client connections.
- **Least Privilege Access**: Separate database roles (`jarvis_app` with DML-only privileges vs `jarvis_migrator` for DDL schema changes).
- **Hashed Credentials**: API keys and passwords hashed via Argon2id / SHA-256 before insertion.

---

## 11. Backup & Recovery

- **Automated Daily Backups**: Executed via `pg_dump` compressed scripts scheduled at 02:00 UTC.
- **WAL Archiving**: Continuous Write-Ahead Log archiving to support Point-In-Time Recovery (PITR).
- **Recovery SLA Targets**:
  - **Recovery Time Objective (RTO)**: < 15 minutes.
  - **Recovery Point Objective (RPO)**: < 5 minutes.

---

## 12. Monitoring & Health Checks

- **Slow Query Logging**: Log any query exceeding **100ms** duration using `pg_stat_statements`.
- **Active Connections Check**: Monitor active pool utilization to alert on starvation (>85% pool capacity).
- **Disk Space Metrics**: Automated alerts when database storage volume drops below **20% free space**.

---

## 13. Database Testing

```bash
# Execute Prisma Schema Validation
pnpm exec prisma validate

# Run Database Integration Tests against test DB container
pnpm run test:db
```

---

## 14. Coding Standards

- **Tables / Columns**: `snake_case` in SQL / database (`users`, `created_at`).
- **Prisma Models**: `PascalCase` in `schema.prisma` (`User`, `Conversation`).
- **Migration Names**: Descriptive timestamped migrations (`20260723_add_vector_index`).

---

## 15. Best Practices

1. **Never Edit Applied Migrations**: Always create a new migration for schema changes.
2. **Soft Deletes for Audit Logs**: Retain critical audit and user activity logs with timestamp flags rather than hard deleting.
3. **Avoid N+1 Queries**: Use Prisma `include` or explicit joins rather than querying relations inside iteration loops.

---

## 16. Acceptance Criteria

The database subsystem is complete and production-ready when:

- [ ] **Schema Validation**: `prisma validate` passes with zero errors.
- [ ] **Migrations Verified**: All schema migrations execute cleanly on clean database container.
- [ ] **Vector Search Latency**: HNSW vector search executes under **30ms** for 10,000 vector records.
- [ ] **Security Compliance**: Connection encryption enforced; least-privilege DB users configured.
- [ ] **Backup Verification**: `pg_dump` and restore playbook successfully validated in staging test.

---

## 17. Conclusion

Following this Database Development Guide ensures that the JARVIS-X data platform remains performant, secure, atomic, and vector-ready. By standardizing relational models, Prisma migration workflows, Redis caching, and HNSW vector indexes, developers can deliver a high-speed data foundation for the AI Operating System.
