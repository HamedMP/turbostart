# Deployment

This guide covers deploying the turbostart template to various platforms.

## Deployment Options

| Target | Best For | Services |
|--------|----------|----------|
| Cloudflare Workers | Landing page, static sites | Frontend only |
| Docker (VPS) | Full-stack applications | All services |
| Hybrid | Best of both | Frontend on CF, Backend on VPS |

## Cloudflare Workers (Frontend)

Deploy the frontend to Cloudflare's global edge network for fast, low-latency access.

### Prerequisites

1. [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (included as dev dependency)

### Manual Deployment

```bash
cd apps/frontend

# Login to Cloudflare
npx wrangler login

# Build for Cloudflare Workers
pnpm build:cf

# Preview locally
pnpm preview:cf

# Deploy
pnpm deploy:cf
```

### CI/CD with GitHub Actions

The template includes automatic deployment via `.github/workflows/deploy-landing.yml`.

**Setup:**

1. **Create API Token:**
   - Go to https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Use "Edit Cloudflare Workers" template
   - Required permissions:
     - Account: Workers Scripts: Edit
     - Zone: Workers Routes: Edit
   - Click "Continue to summary" → "Create Token"
   - Copy the token

2. **Add to GitHub:**
   - Go to your repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: paste your token
   - Click "Add secret"

3. **Trigger Deployment:**
   - Push to `main` branch with changes in `apps/frontend/**`
   - Or manually trigger via Actions tab → "Deploy Landing Page" → "Run workflow"

### Custom Domain

1. In Cloudflare Dashboard, go to Workers & Pages
2. Select your worker
3. Go to "Custom Domains" tab
4. Add your domain (must be on Cloudflare DNS)

### Environment Variables

For Cloudflare Workers, set environment variables via:

```bash
# Using wrangler
npx wrangler secret put MY_SECRET

# Or in wrangler.toml
[vars]
PUBLIC_API_URL = "https://api.example.com"
```

## Docker Production (VPS)

Deploy the full stack to any VPS provider (DigitalOcean, Hetzner, AWS EC2, etc.).

### Prerequisites

- VPS with Docker and Docker Compose installed
- Domain pointed to your server (optional)
- SSL certificate (Let's Encrypt via Cloudflare Tunnel or Caddy)

### Deployment Steps

1. **Clone to server:**
   ```bash
   git clone https://github.com/HamedMP/turbostart.git
   cd turbostart
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   nano .env  # Edit with production values
   ```

3. **Start production containers:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **With Cloudflare Tunnel (recommended):**
   ```bash
   # Add CLOUDFLARE_TUNNEL_TOKEN to .env
   docker-compose -f docker-compose.prod.yml --profile tunnel up -d
   ```

### Production Environment Variables

```bash
# Required
POSTGRES_PASSWORD=<strong-random-password>
API_KEY=<strong-random-api-key>
NODE_ENV=production

# For Telegram bot
TELEGRAM_BOT_TOKEN=<from-botfather>

# For Cloudflare Tunnel
CLOUDFLARE_TUNNEL_TOKEN=<from-cloudflare-zero-trust>
```

### Health Checks

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check backend health
curl http://localhost:4000/health
```

### Updates

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## Hybrid Deployment

For best performance and cost efficiency:

1. **Frontend:** Deploy to Cloudflare Workers (global edge, free tier generous)
2. **Backend:** Deploy to VPS (persistent connections, database access)
3. **Database:** PostgreSQL on VPS or managed service (Supabase, Neon)

### Configuration

Update frontend environment to point to production backend:

```bash
# In Cloudflare Worker environment
VITE_BACKEND_URL=https://api.yourdomain.com
```

## Database Options

### Self-hosted PostgreSQL (Default)

Included in Docker Compose. Data persisted in Docker volume.

### Managed PostgreSQL

For production, consider:
- [Supabase](https://supabase.com/) - Free tier, Postgres with extras
- [Neon](https://neon.tech/) - Serverless Postgres, generous free tier
- [PlanetScale](https://planetscale.com/) - MySQL-compatible (requires schema changes)

Update `DATABASE_URL` in your environment:
```bash
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

## Monitoring

### PostHog Analytics

The template includes PostHog integration:

```bash
# Set in environment
POSTHOG_API_KEY=phc_xxx
POSTHOG_HOST=https://app.posthog.com  # or https://eu.posthog.com
```

### Health Endpoints

- Backend: `GET /health` - Returns `{ status: 'ok', timestamp: ... }`

### Logging

Production containers output JSON logs:
```bash
docker-compose -f docker-compose.prod.yml logs -f --tail=100 backend
```

## Security Checklist

- [ ] Strong, unique `POSTGRES_PASSWORD`
- [ ] Strong, unique `API_KEY`
- [ ] HTTPS enabled (via Cloudflare Tunnel or reverse proxy)
- [ ] Environment variables not committed to git
- [ ] Database not exposed to public internet
- [ ] Regular backups configured
- [ ] Rate limiting enabled on API
