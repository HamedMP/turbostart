# Local Development

This guide covers setting up your local development environment using Docker.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- [pnpm](https://pnpm.io/installation) (for running commands outside Docker)
- [Node.js 20+](https://nodejs.org/) (optional, for local tooling)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/HamedMP/turbostart.git
cd turbostart

# Copy environment variables
cp .env.example .env
# Edit .env with your values (at minimum: POSTGRES_PASSWORD, API_KEY)

# Start all services
docker-compose up
```

Services will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **PostgreSQL:** localhost:5434

## Docker Compose Profiles

The template uses Docker Compose profiles to manage optional services:

```bash
# Core only (postgres + backend + frontend)
docker-compose up

# Include Telegram bot
docker-compose --profile bot up

# Include Remotion video service
docker-compose --profile video up

# Include everything
docker-compose --profile full up
```

## Hot Reload

All services support hot reload in development:

| Service | Mechanism |
|---------|-----------|
| Frontend | Vite HMR via volume mount |
| Backend | Bun watch mode via volume mount |
| Bot | Node.js watch via volume mount |

Source directories are mounted read-only into containers:
- `./apps/frontend/src` → `/app/apps/frontend/src`
- `./apps/backend/src` → `/app/apps/backend/src`

Changes to source files are reflected immediately.

## Database Management

### Access PostgreSQL

```bash
# Connect via psql
docker exec -it turboapp-postgres psql -U myapp -d myapp

# Or use your preferred client
# Host: localhost, Port: 5434, User: myapp, DB: myapp
```

### Drizzle ORM Commands

```bash
cd apps/backend

# Generate migrations from schema changes
bun run db:generate

# Run pending migrations
bun run db:migrate

# Push schema directly (dev only, no migration files)
bun run db:push

# Open Drizzle Studio (database GUI)
bun run db:studio
```

### Reset Database

```bash
# Stop and remove containers + volumes
docker-compose down -v

# Start fresh
docker-compose up
```

## Running Without Docker

If you prefer running services directly:

```bash
# Install dependencies
pnpm install

# Start PostgreSQL separately (or use a cloud database)
# Update DATABASE_URL in apps/backend/.env

# Start all apps
pnpm dev

# Or start specific apps
pnpm --filter frontend dev
pnpm --filter backend dev
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs frontend
docker-compose logs backend

# Rebuild containers
docker-compose build --no-cache
docker-compose up
```

### Port already in use

```bash
# Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or change ports in docker-compose.yml
```

### Hot reload not working

1. Ensure source directories are mounted correctly
2. Restart the container: `docker-compose restart frontend`
3. Check Docker Desktop has file sharing enabled for your project directory

### Database connection refused

1. Wait for postgres health check: `docker-compose logs postgres`
2. Ensure DATABASE_URL matches docker-compose service name (`postgres`, not `localhost`)
