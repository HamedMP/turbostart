# Base stage with pnpm
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml* ./
COPY turbo.json ./

# Copy package.json files for dependency resolution
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source code
COPY packages/shared-types ./packages/shared-types
COPY packages/ui ./packages/ui
COPY apps/frontend ./apps/frontend

# ============================================================================
# Development stage (for docker-compose dev)
# ============================================================================
FROM base AS development

WORKDIR /app/apps/frontend

ENV NODE_ENV=development
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["pnpm", "dev"]

# ============================================================================
# Build stage (for production)
# ============================================================================
FROM base AS builder

# Build arguments for environment variables
ARG VITE_BACKEND_URL=""
ARG VITE_APP_TITLE="My App"
ARG BACKEND_INTERNAL_URL="http://backend:4000"
ARG VITE_PUBLIC_POSTHOG_KEY=""
ARG VITE_PUBLIC_POSTHOG_HOST=""

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_APP_TITLE=$VITE_APP_TITLE
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL
ENV VITE_PUBLIC_POSTHOG_KEY=$VITE_PUBLIC_POSTHOG_KEY
ENV VITE_PUBLIC_POSTHOG_HOST=$VITE_PUBLIC_POSTHOG_HOST

# Build the application
WORKDIR /app/apps/frontend
RUN pnpm build

# Production stage with Bun (for running Nitro SSR server)
FROM oven/bun:alpine AS runner

WORKDIR /app

# Copy the built output
COPY --from=builder /app/apps/frontend/.output ./.output

# Environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["bun", ".output/server/index.mjs"]
