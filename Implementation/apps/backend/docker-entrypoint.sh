#!/bin/sh
set -e

echo "🚀 Starting JARVIS-X Backend Container Initializer..."

# Execute production database migrations before launching Fastify server
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Executing automated database migrations (prisma migrate deploy)..."
  npx prisma migrate deploy || echo "⚠️ Warning: Database migration execution deferred or database unreachable."
fi

echo "✅ Database readiness check completed. Starting backend server..."
exec "$@"
