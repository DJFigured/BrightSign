# Deployment Guide - BrightSign EU E-shop

## VPS Info

- Provider: Hetzner (CAX21, 4 GB RAM)
- IP: 91.99.49.122
- SSH: `ssh dan@makemore.cz`

## Prerequisites

- Docker and Docker Compose installed on the VPS
- SSH access to the server
- Domain name (optional for initial setup)

```bash
# Install Docker (if not installed)
curl -fsSL https://get.docker.com | sh
usermod -aG docker dan

# Install Docker Compose plugin
apt-get install docker-compose-plugin

# Verify
docker --version && docker compose version
```

## Initial Deployment

### 1. Clone and configure

```bash
ssh dan@makemore.cz
git clone https://github.com/YOUR_REPO/brightsight.git /opt/brightsight
cd /opt/brightsight

# Create and fill environment file
cp .env.production.template .env.production
nano .env.production

# Generate secrets:
openssl rand -hex 32  # for JWT_SECRET
openssl rand -hex 32  # for COOKIE_SECRET
openssl rand -hex 32  # for POSTGRES_PASSWORD
openssl rand -hex 32  # for MINIO_ROOT_PASSWORD (also S3_SECRET_KEY)
```

### 2. First run

```bash
# Start database and redis first
docker compose -f docker-compose.prod.yml up -d postgres redis
sleep 10

# Build and start everything
docker compose -f docker-compose.prod.yml up -d --build

# Run Medusa migrations
docker compose -f docker-compose.prod.yml exec backend npx medusa db:migrate

# Create admin user
docker compose -f docker-compose.prod.yml exec backend npx medusa user \
  -e admin@brightsign.cz -p 'YOUR_ADMIN_PASSWORD'
```

### 3. Get Publishable API Key

1. Open `http://91.99.49.122/app`
2. Login -> Settings -> API Keys
3. Copy publishable key to `.env.production` -> `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
4. Rebuild storefront: `docker compose -f docker-compose.prod.yml up -d --build storefront`

### 4. Create MinIO bucket

```bash
# Install mc (MinIO client) on VPS
docker compose -f docker-compose.prod.yml exec minio mc alias set local http://localhost:9000 brightsign MINIO_PASSWORD
docker compose -f docker-compose.prod.yml exec minio mc mb local/brightsign-media
```

Visit `http://91.99.49.122` for the storefront and `http://91.99.49.122/app` for admin.

## Adding a Domain

1. Point DNS A record to `91.99.49.122`

2. Edit `Caddyfile` -- replace `:80` block with your domain:

```
brightsign.cz {
    handle /app* { reverse_proxy backend:9000 }
    handle /api/* { reverse_proxy backend:9000 }
    handle /admin/* { reverse_proxy backend:9000 }
    handle { reverse_proxy storefront:3000 }
}
```

3. Update `.env.production` CORS and URLs:

```
BACKEND_URL=https://brightsign.cz
NEXT_PUBLIC_BASE_URL=https://brightsign.cz
STORE_CORS=https://brightsign.cz
ADMIN_CORS=https://brightsign.cz
AUTH_CORS=https://brightsign.cz
```

4. Rebuild:

```bash
docker compose -f docker-compose.prod.yml up -d --build storefront
docker compose -f docker-compose.prod.yml restart caddy backend
```

Caddy will automatically obtain a TLS certificate from Let's Encrypt.

## Updating the App

```bash
cd /opt/brightsight
git pull
docker compose -f docker-compose.prod.yml up -d --build
# Run migrations if needed:
docker compose -f docker-compose.prod.yml exec backend npx medusa db:migrate
```

## Backups

### Database backup

```bash
# Manual backup
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U medusa medusa | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore
gunzip -c backup_20260221.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T postgres psql -U medusa medusa
```

### Automated daily backup (cron)

```bash
crontab -e
# Add:
0 3 * * * cd /opt/brightsight && docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U medusa medusa | gzip > /opt/backups/brightsign_$(date +\%Y\%m\%d).sql.gz
```

### MinIO backup

```bash
docker run --rm \
  -v brightsight_minio_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/minio_$(date +%Y%m%d).tar.gz /data
```

## Common Operations

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f storefront
docker compose -f docker-compose.prod.yml logs -f caddy

# Restart a single service
docker compose -f docker-compose.prod.yml restart backend

# Run Medusa CLI commands
docker compose -f docker-compose.prod.yml exec backend npx medusa db:migrate

# Access MinIO console at http://91.99.49.122:9001

# Shell into a container
docker compose -f docker-compose.prod.yml exec backend sh

# Check service health
docker compose -f docker-compose.prod.yml ps
```
