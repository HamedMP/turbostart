# Dockerfile for Backend (Bun + Hono) - OPTIMIZED
# Security: Non-root user, minimal layers, no secrets copied
# Performance: Efficient caching, reuses deps stage, specific Bun version

ARG BUN_VERSION=1.2
FROM oven/bun:${BUN_VERSION}-alpine AS base

WORKDIR /app

# ============================================================================
# Dependencies stage - Production dependencies only
# ============================================================================
FROM base AS deps

COPY apps/backend/package.json apps/backend/bun.lock* ./apps/backend/

WORKDIR /app/apps/backend

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production || bun install --production

# ============================================================================
# Builder stage - All dependencies + build
# ============================================================================
FROM base AS builder

COPY apps/backend/package.json apps/backend/bun.lock* ./apps/backend/

WORKDIR /app/apps/backend

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile || bun install

COPY apps/backend/tsconfig.json* ./
COPY apps/backend/src ./src

RUN bun run build 2>/dev/null || echo "No build step defined"

# ============================================================================
# Development stage - For hot reload in docker-compose
# ============================================================================
FROM builder AS development

ENV NODE_ENV=development

EXPOSE 4000

CMD ["bun", "--watch", "src/index.ts"]

# ============================================================================
# Production stage - Minimal runtime image
# ============================================================================
FROM base AS runner

# Security: Create non-root user
RUN addgroup -g 1001 -S bunuser && \
    adduser -S bunuser -u 1001 -G bunuser

WORKDIR /app

# Copy production dependencies
COPY --from=deps --chown=bunuser:bunuser /app/apps/backend/node_modules ./node_modules
COPY --from=deps --chown=bunuser:bunuser /app/apps/backend/package.json ./package.json

# Copy source files
COPY --from=builder --chown=bunuser:bunuser /app/apps/backend/src ./src

# Copy dist if exists
COPY --from=builder --chown=bunuser:bunuser /app/apps/backend/dist ./dist

USER bunuser

EXPOSE 4000

ENV PORT=4000
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun run --eval "fetch('http://localhost:4000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))" || exit 1

CMD ["sh", "-c", "[ -d dist ] && bun run dist/index.js || bun run src/index.ts"]
