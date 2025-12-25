# Dockerfile for Bot (Node.js + Grammy) - OPTIMIZED
# Security: Non-root user, minimal layers, no secrets copied
# Performance: Efficient caching, pinned versions

ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS base

WORKDIR /app

# Install pnpm using corepack
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && \
    corepack prepare pnpm@10.9.0 --activate

# ============================================================================
# Dependencies stage - Production dependencies only
# ============================================================================
FROM base AS deps

WORKDIR /app

COPY apps/bot/package.json ./

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --prod

# ============================================================================
# Builder stage - All dependencies + build
# ============================================================================
FROM base AS builder

WORKDIR /app

COPY apps/bot/package.json ./

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install

COPY apps/bot/tsconfig.json ./
COPY apps/bot/src ./src

RUN pnpm run build

# ============================================================================
# Development stage - For hot reload in docker-compose
# ============================================================================
FROM builder AS development

ENV NODE_ENV=development

CMD ["pnpm", "run", "dev"]

# ============================================================================
# Production stage - Minimal runtime image
# ============================================================================
FROM base AS runner

RUN addgroup -g 1001 -S nodejs && \
    adduser -S botuser -u 1001 -G nodejs

WORKDIR /app

COPY --from=deps --chown=botuser:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=botuser:nodejs /app/package.json ./package.json
COPY --from=builder --chown=botuser:nodejs /app/dist ./dist

USER botuser

ENV NODE_ENV=production

HEALTHCHECK --interval=60s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

CMD ["node", "dist/bot.js"]
