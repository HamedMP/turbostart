# Dockerfile for Video Rendering Service (Remotion + Bun)
# Provides HTTP API for video rendering

FROM oven/bun:1.2-debian AS base

# Install Chrome dependencies, ffmpeg, and curl for health checks
RUN apt-get update && apt-get install -y \
    chromium \
    ffmpeg \
    fonts-noto-color-emoji \
    curl \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Chrome path for Remotion
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV REMOTION_CHROME_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# ============================================================================
# Dependencies stage
# ============================================================================
FROM base AS deps

COPY apps/video/package.json ./

# Install dependencies
RUN bun install

# ============================================================================
# Builder stage
# ============================================================================
FROM deps AS builder

# Copy source files
COPY apps/video/src ./src
COPY apps/video/server.ts ./server.ts
COPY apps/video/remotion.config.ts ./
COPY apps/video/tsconfig.json ./

# ============================================================================
# Production stage
# ============================================================================
FROM base AS runner

WORKDIR /app

# Copy from builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/remotion.config.ts ./
COPY --from=builder /app/tsconfig.json ./

# Create output directory
RUN mkdir -p /app/out

# Expose port
EXPOSE 3001

ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Run the server
CMD ["bun", "run", "server.ts"]
