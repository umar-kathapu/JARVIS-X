# JARVIS-X Memory Engine Specification

**Document Version:** 1.0.0-draft  
**Last Updated:** 2026-07-23  
**Status:** Active Draft  
**Target System:** JARVIS-X Context & Persistent Memory Subsystem  

---

## 1. Purpose
The Memory Engine is the foundational persistence and personalization engine of JARVIS-X. While traditional conversational wrappers operate statelessly between sessions, JARVIS-X relies on the Memory Engine to continuously record, index, retrieve, and synthesize user context, preferences, workspace facts, project goals, and execution histories. It transforms the system from a reactive assistant into an adaptive, hyper-personalized AI Operating System.

---

## 2. Vision
To create an omnipresent memory subsystem that enables JARVIS-X to remember past interactions, learn user habits over time, anticipate task requirements, and maintain seamless continuity across days, months, and years of operation—all while ensuring complete user privacy, local data ownership, and explicit memory control.

---

## 3. Design Principles
*   **Persistent Memory:** Information is retained across application reboots and system updates using robust local databases.
*   **Context Awareness:** Dynamically retrieves relevant memories based on active workspace states, running applications, and current dialogue goals.
*   **Privacy-First:** All vector embeddings, relational logs, and conversation transcripts remain 100% on the local host.
*   **User Control:** Provides absolute user sovereignty to inspect, edit, export, prune, or completely wipe stored memory entries.
*   **Fast Retrieval:** Sub-50ms query responses using indexed vector similarity searches and in-memory key-value caching.
*   **Modular Design:** Decouples storage adapters (SQLite, ChromaDB/Qdrant) from memory classification and ranking algorithms.
*   **Scalability:** Supports indexing millions of documents, code snippets, and interaction logs without degrading retrieval latency.

---

## 4. Memory Responsibilities
1.  **Memory Storage & Encoding:** Converting dialogue turns, workspace events, and user facts into structured relational records and vector embeddings.
2.  **Contextual Retrieval:** Executing hybrid (keyword + semantic similarity) queries to fetch the most relevant memory records for active AI prompts.
3.  **Memory Update & Consolidation:** Merging new facts with existing records to avoid redundancy and updating outdated user preferences.
4.  **Controlled Forgetting:** Automatically expiring transient session data and executing user-driven deletions.
5.  **Semantic Vector Indexing:** Maintaining high-density vector indices for semantic similarity lookups.
6.  **Context Injection:** Formatting retrieved memories into token-budgeted prompt blocks for the AI Brain.
7.  **Personalization Enforcement:** Injecting user coding styles, role profiles, and operational guidelines into every task execution.

---

## 5. Memory Architecture

The data pipeline processes memory lookups and storage requests through distinct stages:

```
[ User Input / System Event ]
              |
              v
    [ 1. Memory Manager ] <===> [ Transient Session Cache ]
              |
              v
  [ 2. Memory Classifier ] (Categories: Preference, Project, Task, Skill)
              |
              v
     [ 3. Storage Layer ] <===> [ Relational DB (SQLite) & Vector DB (Chroma/Qdrant) ]
              |
              v
   [ 4. Retrieval Engine ] (Hybrid Keyword + Semantic Vector Search)
              |
              v
    [ 5. Ranking Engine ] (Recency x Importance x Cosine Similarity)
              |
              v
    [ 6. Context Builder ] (Token Budgeting & Markdown Formatting)
              |
              v
       [ AI Brain Engine ]
```

---

## 6. Memory Types

JARVIS-X organizes memory into six specialized functional tiers:

| Memory Tier | Retention Scope | Storage Engine | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **Short-Term Memory** | Active Command / Turn | In-Memory Buffer | Immediate prompt context, current execution step |
| **Working Memory** | Active Task / Thread | SQLite (Transient Table) | Active step list, temporary file diffs, tool outputs |
| **Long-Term Memory** | Permanent (Cross-Session) | SQLite & Vector DB | Core user facts, project rules, persistent configurations |
| **Session Memory** | Single App Session | SQLite Log Table | Dialogue turns from current boot session |
| **Semantic Memory** | Permanent | Vector Database | Document embeddings, code snippets, general knowledge |
| **Episodic Memory** | Permanent | SQLite & Vector DB | Past task execution logs, historical error resolution steps |

---

## 7. Memory Lifecycle

```
1. CREATION: Fact or event is identified in user dialogue or system logs.
2. VALIDATION: Memory Classifier validates data structure and filters out secret keys/passwords.
3. CATEGORIZATION: Assigned tags (e.g., preference, coding-style, project-x).
4. STORAGE: Written to SQLite relational tables and embedded into local Vector DB.
5. RETRIEVAL: Fetched during context construction via hybrid vector similarity search.
6. UPDATE: Existing entries are consolidated or updated when new contradicting facts arrive.
7. EXPIRATION: Transient working memories are purged after task completion or session end.
8. DELETION: Manual or automated permanent deletion from both relational and vector stores.
```

---

## 8. Memory Classification

Memories are indexed using a standardized taxonomy:

*   **Preferences:** User coding style (e.g., "Prefers TypeScript over JS"), UI theme choices, preferred CLI flags.
*   **Projects:** Project names, repository root paths, architecture specifications, key dependencies.
*   **Goals:** Long-term milestones, current development sprint objectives, user task lists.
*   **Skills:** Installed plugin tools, custom shell scripts, user-taught execution macros.
*   **Contacts:** Team member names, roles, communication preferences, public handles.
*   **Conversations:** Summarized dialogue history and key decisions made during past sessions.
*   **Tasks:** Historical task completion records, compilation error solutions, command fix histories.
*   **Custom Categories:** Extensible tags defined by custom third-party plugins.

---

## 9. Memory Retrieval Engine

Retrieval combines three complementary scoring mechanisms:

$$\text{Final Rank Score} = (w_1 \cdot \text{Similarity}) + (w_2 \cdot \text{Recency}) + (w_3 \cdot \text{Importance})$$

1.  **Semantic Vector Search:** Cosine similarity calculation (`0.0` to `1.0`) against stored embeddings in ChromaDB/Qdrant.
2.  **Keyword Exact Matching:** SQLite FTS5 (Full-Text Search) matching specific entity names, file paths, or error codes.
3.  **Recency & Importance Decay:** Exponential time-decay function prioritizing recent context while preserving high-importance anchor facts (e.g., core security rules).

---

## 10. Context Integration
To prevent memory injection from overwhelming the LLM context window:
*   **Token Budgeting:** Memory injection is allocated a strict percentage of the total context window (default: maximum 20% of context capacity, e.g., 2048 tokens).
*   **Summarization & Compression:** Older episodic memory logs are automatically summarized into bullet points prior to prompt insertion.
*   **Markdown Structuring:** Retrieved memories are injected into the system prompt inside explicit XML/Markdown blocks:

```markdown
<retrieved_memory_context>
- User Preference: Prefers strict type checking with MyPy in Python scripts.
- Active Project: JARVIS-X (Root: D:/Projects/Specifications).
- Relevant Past Solution: Fix compilation error by setting `PYTHONPATH=.`.
</retrieved_memory_context>
```

---

## 11. Storage Strategy

```
/user_data_directory/memory
├── /sqlite
│   └── jarvis_memory.db       # Relational tables: sessions, facts, task_logs (FTS5 enabled)
├── /vector
│   └── /chroma_db             # Persistent vector embedding stores & indices
└── /backups
    └── memory_backup.json     # Automated JSON export backups
```

*   **Local Storage:** All database files reside locally in the user's secure application data folder.
*   **Database Layer:** SQLite 3 with WAL (Write-Ahead Logging) enabled for high-concurrency read/write access.
*   **Vector Database:** Local ChromaDB or Qdrant engine executing locally without external API dependencies.
*   **Backup Strategy:** Daily automated local snapshots exported to compressed JSON files.

---

## 12. Privacy & User Control
*   **Memory Inspector Interface:** A dedicated UI panel allowing users to search, view, edit, or delete any individual memory entry.
*   **One-Click Memory Purge:** A prominent security feature to instantly wipe all vector embeddings, dialogue logs, and relational databases.
*   **Blacklist Rules:** Users can configure paths or topics (e.g., `/personal/finance/` or "medical records") that the Memory Engine is strictly forbidden from recording or indexing.
*   **Export & Import:** Ability to export complete memory profiles to encrypted `.jarvis-mem` files for local migration to new hardware.

---

## 13. Performance Optimization
*   **In-Memory Hot Cache:** High-frequency memory facts (such as user name and active project root) are cached in RAM for 0ms lookup latency.
*   **Async Indexing:** Vector embedding generation runs in background worker threads, preventing memory writes from blocking user interactions.
*   **Vector Quantization:** Embeddings are quantized to reduce RAM footprint while maintaining > 98% retrieval accuracy.
*   **Batch Operations:** Multiple memory updates are wrapped in single SQLite transactions to maximize IOPS efficiency.

---

## 14. Error Handling & Resilience
*   **Corrupted Database Recovery:** Automatic integrity checks (`PRAGMA quick_check`) on startup. If corruption is detected, the engine restores from the latest automated JSON backup.
*   **Duplicate Consolidation:** Deduplication routines identify and merge semantically identical memory entries during idle background cycles.
*   **Fallback Search:** If the vector database fails to initialize, the Memory Engine seamlessly falls back to SQLite text search without failing AI operations.

---

## 15. Security
*   **Encryption at Rest:** Sensitive memory tables and vector databases are encrypted using AES-256 (via SQLCipher) using keys stored in the OS native vault.
*   **Credential Filtering:** Automated regex scanners inspect memories before storage, redacting API keys, access tokens, and credit card numbers.
*   **Access Isolation:** Memory interfaces are accessible only by authorized internal backend services; external plugins cannot query the memory database directly without explicit user permission grants.

---

## 16. Scalability
The Memory Engine supports scaling up to millions of entries by:
1.  Partitioning vector stores by workspace/project domains.
2.  Utilizing HNSW (Hierarchical Navigable Small World) graph indexing in the vector store for logarithmic search scaling.
3.  Archiving inactive episodic memory logs older than 90 days into compressed cold-storage archives.

---

## 17. Testing Strategy
*   **Unit Tests:** Test memory classification logic, sanitization filters, and token budgeting math.
*   **Retrieval Evals:** Evaluate hybrid search accuracy against test datasets using Mean Reciprocal Rank (MRR) and Normalized Discounted Cumulative Gain (NDCG) metrics.
*   **Performance Benchmarks:** Verify that hybrid search queries return results within < 50ms under a load of 500,000 indexed memory items.
*   **Privacy Audits:** Automated unit tests verifying that blacklisted keywords and API keys are never written to disk.

---

## 18. Acceptance Criteria
*   [ ] Hybrid memory retrieval (SQLite FTS5 + Vector Search) returns context in < 50ms.
*   [ ] Memory Inspector UI allows full viewing, editing, and deletion of stored facts.
*   [ ] One-Click Purge successfully deletes all relational and vector database files from disk.
*   [ ] Sensitive API keys and passwords are 100% redacted before memory storage.
*   [ ] Database corruption auto-recovery successfully restores memory state from local JSON backups.

---

## 19. Conclusion
The Memory Engine Specification provides the architectural foundation for long-term intelligence and personalization in JARVIS-X. By combining multi-tiered memory storage, hybrid vector retrieval, strict token budgeting, local AES-256 encryption, and complete user sovereignty, the Memory Engine ensures JARVIS-X evolves into a deeply personalized, secure, and context-aware AI Operating System.
