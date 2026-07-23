FROM node:20-alpine AS base
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/backend ./apps/backend

RUN pnpm install --frozen-lockfile || pnpm install

WORKDIR /app/apps/backend
RUN pnpm prisma:generate
RUN pnpm build

EXPOSE 4000
CMD ["pnpm", "start"]
