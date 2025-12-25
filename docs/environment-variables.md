# Environment Variables

This reference documents all environment variables used across the turbostart template.

## Quick Setup

```bash
# Copy the example file
cp .env.example .env

# Edit with your values
nano .env
```

## Core Variables

### Database

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `POSTGRES_USER` | Yes | `myapp` | Database user (Docker) |
| `POSTGRES_PASSWORD` | Yes | - | Database password |
| `POSTGRES_DB` | Yes | `myapp` | Database name |

**Example:**
```bash
DATABASE_URL=postgresql://myapp:secretpassword@localhost:5434/myapp
```

### Application

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode |
| `API_KEY` | Yes | - | API authentication key |

## Frontend Variables

Variables prefixed with `VITE_` are exposed to the browser.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_BACKEND_URL` | No | `http://localhost:4000` | Backend API URL |
| `VITE_POSTHOG_KEY` | No | - | PostHog project key |
| `VITE_POSTHOG_HOST` | No | `https://app.posthog.com` | PostHog host |

## Backend Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `4000` | Server port |
| `DATABASE_URL` | Yes | - | PostgreSQL connection |
| `API_KEY` | Yes | - | API authentication |

## Docker Compose

The following are used in `docker-compose.yml`:

| Variable | Service | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | postgres | Database user |
| `POSTGRES_PASSWORD` | postgres | Database password |
| `POSTGRES_DB` | postgres | Database name |

## Production Variables

Additional variables for production deployment:

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDFLARE_API_TOKEN` | CF deploy | Cloudflare Workers API token |
| `CLOUDFLARE_TUNNEL_TOKEN` | CF Tunnel | Zero Trust tunnel token |

## Generating Secrets

```bash
# Generate a strong random password
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore` by default
2. **Use strong passwords** - At least 32 random characters
3. **Rotate secrets regularly** - Especially API keys
4. **Use different values per environment** - Dev, staging, production
5. **Limit secret access** - Only those who need them
