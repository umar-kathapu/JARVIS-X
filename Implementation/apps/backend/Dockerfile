# ==========================================
# Stage 1: Build & Dependencies Setup
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/backend ./apps/backend

RUN pnpm install --frozen-lockfile || pnpm install

WORKDIR /app/apps/backend
RUN pnpm prisma:generate
RUN pnpm build

# Prune devDependencies for lightweight production runtime
RUN pnpm prune --prod

# ==========================================
# Stage 2: Minimal Production Runtime
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app/apps/backend

ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

# Install curl for container health check
RUN apk add --no-cache curl

# Security Hardening: Create non-root user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 jarvis

# Copy production artifacts and node_modules from builder stage
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/apps/backend/package.json ./package.json
COPY --from=builder /app/apps/backend/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh && chown -R jarvis:nodejs /app

USER jarvis

EXPOSE 4000

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
