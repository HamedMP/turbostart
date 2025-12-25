# Turbo Repo Template

## Project Overview

A production-ready monorepo template with Telegram bot, Bun backend, React frontend (TanStack Start), and Remotion video generation. Uses Turborepo for build orchestration and pnpm for package management.

## Tech Stack

### Monorepo Structure

- **Package Manager**: pnpm with workspaces
- **Build System**: Turborepo
- **Runtime**: Bun (backend, video), Node.js (frontend SSR)

### Applications

| App | Path | Framework | Port | Required |
|-----|------|-----------|------|----------|
| Backend | `apps/backend` | Hono + Drizzle | 4000 | Yes |
| Frontend | `apps/frontend` | TanStack Start | 3000 | Yes |
| Bot | `apps/bot` | Grammy | - | Optional |
| Video | `apps/video` | Remotion | 3001 | Optional |

**Note**: Bot and Video apps are optional. See "Optional Apps" section below.

### Packages

| Package | Path | Purpose |
|---------|------|---------|
| shared-types | `packages/shared-types` | TypeScript types shared across apps |
| ui | `packages/ui` | shadcn/ui components |

## Project Structure

```
turbo-repo-template/
├── apps/
│   ├── backend/          # Bun + Hono API server
│   │   ├── src/
│   │   │   ├── index.ts  # Server entry point
│   │   │   ├── db/       # Drizzle schema & connection
│   │   │   ├── routes/   # API route handlers
│   │   │   ├── services/ # Business logic
│   │   │   └── middleware/
│   │   ├── drizzle/      # Database migrations
│   │   └── Dockerfile
│   │
│   ├── bot/              # Grammy Telegram bot
│   │   ├── src/
│   │   │   ├── bot.ts    # Bot entry point
│   │   │   └── services/ # API client
│   │   └── Dockerfile
│   │
│   ├── frontend/         # TanStack Start (React SSR)
│   │   ├── src/
│   │   │   ├── routes/   # File-based routing
│   │   │   ├── components/
│   │   │   └── integrations/
│   │   └── Dockerfile
│   │
│   └── video/            # Remotion video service
│       ├── src/
│       │   ├── ContentVideo.tsx  # Video composition
│       │   └── Root.tsx          # Remotion root
│       ├── server.ts     # HTTP render API
│       └── Dockerfile
│
├── packages/
│   ├── shared-types/     # TypeScript types
│   └── ui/               # shadcn/ui components
│
├── docker-compose.yml    # Development setup
├── docker-compose.prod.yml
├── turbo.json
└── pnpm-workspace.yaml
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Start all apps in dev mode
pnpm dev

# Start core apps only (no bot/video)
pnpm dev:core

# Start specific app
pnpm --filter backend dev
pnpm --filter frontend dev

# Database commands (Drizzle)
cd apps/backend
bun run db:generate    # Generate migrations
bun run db:migrate     # Run migrations
bun run db:push        # Push schema (dev only)
bun run db:studio      # Open Drizzle Studio

# Build all apps
pnpm build

# Build core apps only
pnpm build:core

# Type check (traditional)
pnpm typecheck

# Type check (fast with tsgo)
pnpm typecheck:fast

# Add shadcn component
cd apps/frontend
npx shadcn@latest add button
```

## Optional Apps

The **Bot** and **Video** apps are optional. You can exclude them:

### Local Development

```bash
# Run core apps only (backend + frontend)
pnpm dev:core

# Or manually filter
pnpm dev --filter=!bot --filter=!video
```

### Docker (with profiles)

```bash
# Core only (backend + frontend + postgres)
docker-compose up

# Include bot
docker-compose --profile bot up

# Include video
docker-compose --profile video up

# Include everything
docker-compose --profile full up
```

### Remove Completely

Delete `apps/bot` and/or `apps/video` folders if you don't need them.

## Type-Safe Environment Variables

This template uses `@t3-oss/env-core` for runtime-validated environment variables.

Each app has an `env.ts` file:

```typescript
// apps/backend/src/env.ts
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    API_KEY: z.string().min(1),
  },
  runtimeEnv: process.env,
});
```

Benefits:
- Type-safe access: `env.DATABASE_URL`
- Validation at startup
- Clear error messages for missing/invalid vars

## Fast Type Checking (tsgo)

This template includes [tsgo](https://github.com/microsoft/typescript-go) (TypeScript 7 native) for 10-25x faster type checking.

```bash
# Fast check with tsgo
pnpm typecheck:fast

# Traditional TypeScript
pnpm typecheck
```

VSCode is configured in `.vscode/settings.json` for tsgo support.

## Environment Variables

### Backend (`apps/backend/.env`)

```bash
# Required
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
API_KEY=your-internal-api-key

# Optional integrations
ANTHROPIC_API_KEY=       # Claude AI
ELEVENLABS_API_KEY=      # Text-to-speech
FAL_AI_KEY=              # Image generation
R2_ACCOUNT_ID=           # Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
POSTHOG_API_KEY=         # Analytics
```

### Bot (`apps/bot/.env`)

```bash
TELEGRAM_BOT_TOKEN=      # From @BotFather
BACKEND_API_URL=http://localhost:4000
BACKEND_API_KEY=         # Same as backend API_KEY
```

### Frontend (`apps/frontend/.env`)

```bash
VITE_BACKEND_URL=http://localhost:4000
VITE_PUBLIC_POSTHOG_KEY=
VITE_PUBLIC_POSTHOG_HOST=
```

## API Conventions

### Route Structure

```
/public/*     - No authentication required
/api/*        - Requires API_KEY header
/api/admin/*  - Requires admin privileges
```

### Response Format

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: string }

// Paginated
{
  items: T[],
  total: number,
  page: number,
  limit: number,
  hasMore: boolean
}
```

## Database Schema

The template includes:
- **users** - Telegram users with credits
- **tasks** - Generic task queue
- **referrals** - User referral tracking
- **activity_logs** - Audit logging

To add new tables:
1. Edit `apps/backend/src/db/schema.ts`
2. Run `bun run db:generate`
3. Run `bun run db:migrate`

## Docker Deployment

```bash
# Development (with hot reload)
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up -d
```

## Key Patterns

### Adding a New API Endpoint

1. Create route file in `apps/backend/src/routes/`
2. Export Hono route handler
3. Import and mount in `apps/backend/src/index.ts`

### Adding a New Bot Command

1. Add command handler in `apps/bot/src/bot.ts`
2. Use `bot.command('name', handler)` pattern
3. Call backend API via `backendClient`

### Adding a New Page (Frontend)

1. Create file in `apps/frontend/src/routes/`
2. Export Route and component using TanStack Router
3. File path = URL path (e.g., `about.tsx` → `/about`)

### Generating Videos

```typescript
// POST to video service
const response = await fetch('http://video:3001/render', {
  method: 'POST',
  body: JSON.stringify({
    lines: ['Line 1', 'Line 2'],
    title: 'My Video',
    subtitle: 'Optional subtitle',
    ctaText: 'Learn More',
    ctaUrl: 'yourapp.com'
  })
});
const videoBuffer = await response.arrayBuffer();
```

## Git Commit Guidelines

- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
- Keep commits focused and atomic
- Reference issue numbers when applicable

## Adding Integrations

### PostHog Analytics

Already configured in frontend. Add events:

```typescript
import { posthog } from '@/integrations/posthog/provider';
posthog.capture('event_name', { property: 'value' });
```

### Anthropic Claude AI

Already configured in backend:

```typescript
import { generateText } from '@/services/anthropic';
const response = await generateText('Your prompt');
```

### Cloudflare R2 Storage

Already configured in backend:

```typescript
import { r2Storage } from '@/services/r2-storage';
await r2Storage.upload('key', buffer, 'image/png');
const url = await r2Storage.getPublicUrl('key');
```

## Troubleshooting

### Port already in use

```bash
lsof -i :4000  # Find process
kill -9 <PID>  # Kill it
```

### Database connection issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Reset database
bun run db:push --force
```

### Turbo cache issues

```bash
# Clear Turbo cache
pnpm turbo clean
```
