# Disaster Recovery & Backup Guide

## Backup Procedures
```bash
# 1. Backup PostgreSQL Database
node scripts/devops/backup-db.js

# 2. Export Vector Memory & Redis State
node scripts/devops/backup-memory.js
```

## Restoration Procedures
```bash
# Restore PostgreSQL from SQL dump file
node scripts/devops/restore-db.js backups/db_backup_2026-07-23.sql
```
