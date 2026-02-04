# Deployment Guide / 部署指南

## Deployment Options

| Method | Use Case |
|--------|----------|
| Docker Compose | Production / staging single-server deployment |
| Vite dev servers | Local development |
| Kubernetes | Enterprise-scale multi-node deployment (config not included) |

---

## Docker Compose Deployment (Recommended)

### Prerequisites

- Docker Engine >= 24.0
- Docker Compose >= 2.20
- Minimum 4 GB RAM, 2 CPU cores
- Ports 80, 443, 3000, 5432, 6379 available

### Steps

#### 1. Clone and configure

```bash
git clone <repo-url>
cd link-reit-membership
cp .env.example apps/backend/.env
```

Edit `apps/backend/.env` with production values:

```ini
NODE_ENV=production
DATABASE_URL=postgresql://postgres:<strong-password>@postgres:5432/link_reit_membership
REDIS_HOST=redis
JWT_SECRET=<generate-a-32-char-random-string>
CORS_ORIGINS=https://admin.membership.linkreit.com,https://mall.membership.linkreit.com
```

#### 2. Configure Nginx SSL

Place SSL certificates in the `nginx/ssl/` directory:

```bash
mkdir -p nginx/ssl
cp /path/to/fullchain.pem nginx/ssl/
cp /path/to/privkey.pem nginx/ssl/
```

Edit `nginx/nginx.conf` with your domain names.

#### 3. Start the stack

```bash
docker-compose up -d
```

This starts:

| Service | Container | Port |
|---------|-----------|------|
| PostgreSQL 16 | link-reit-postgres | 5432 |
| Redis 7 | link-reit-redis | 6379 |
| Backend API | link-reit-backend | 3000 |
| Group Admin | link-reit-group-admin | 3001 → 80 |
| Mall Admin | link-reit-mall-admin | 3002 → 80 |
| Merchant Portal | link-reit-merchant-portal | 3003 → 80 |
| Nginx | link-reit-nginx | 80, 443 |

#### 4. Initialise database

```bash
# Run migrations
docker exec link-reit-backend npx prisma db push

# Seed demo data (optional)
docker exec link-reit-backend npx ts-node prisma/seed.ts
```

#### 5. Verify

```bash
# Check all containers are running
docker-compose ps

# Check backend health
curl http://localhost:3000/api/docs

# Check admin portals
curl -o /dev/null -w "%{http_code}" http://localhost:3001
curl -o /dev/null -w "%{http_code}" http://localhost:3002
curl -o /dev/null -w "%{http_code}" http://localhost:3003
```

---

## Local Development Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL 16 (local or Docker)
- Redis 7 (local or Docker)

### Steps

#### 1. Install dependencies

```bash
pnpm install
```

#### 2. Start infrastructure

Option A — use Docker for just PostgreSQL and Redis:

```bash
docker run -d --name pg16 -p 5432:5432 \
  -e POSTGRES_DB=link_reit_membership \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  postgres:16-alpine

docker run -d --name redis7 -p 6379:6379 redis:7-alpine
```

Option B — use local installs:

```bash
# macOS
brew install postgresql@16 redis
brew services start postgresql@16
brew services start redis

# Ubuntu
sudo apt install postgresql-16 redis-server
sudo systemctl start postgresql redis
```

#### 3. Configure environment

```bash
cp .env.example apps/backend/.env
```

Default values in `.env.example` work for a standard local setup.

#### 4. Set up database

```bash
# Push schema to database
pnpm db:migrate

# Seed demo data
pnpm db:seed

# (Optional) Open Prisma Studio to browse data
pnpm db:studio
```

#### 5. Start services

Start each service in a separate terminal:

```bash
# Terminal 1 — Backend API (http://localhost:3000)
pnpm dev:backend

# Terminal 2 — Group Admin (http://localhost:3001)
pnpm dev:group-admin

# Terminal 3 — Mall Admin (http://localhost:3002)
pnpm dev:mall-admin

# Terminal 4 — Merchant Portal (http://localhost:3003)
pnpm dev:merchant-portal
```

The Customer H5 app (if needed):

```bash
# Terminal 5 — Customer Web (http://localhost:3004)
cd apps/customer-web && npx vite --host 0.0.0.0 --port 3004
```

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_HOST` | Redis hostname | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing key (min 32 chars) | `<random-string>` |
| `APP_PORT` | Backend API port | `3000` |

### Authentication

| Variable | Description |
|----------|-------------|
| `JWT_ACCESS_TOKEN_EXPIRY` | Access token TTL (default: `15m`) |
| `JWT_REFRESH_TOKEN_EXPIRY` | Refresh token TTL (default: `7d`) |
| `M365_TENANT_ID` | Azure AD tenant ID |
| `M365_CLIENT_ID` | Azure AD application client ID |
| `M365_CLIENT_SECRET` | Azure AD client secret |
| `M365_REDIRECT_URI` | OAuth2 callback URL |

### SMS (Twilio)

| Variable | Description |
|----------|-------------|
| `SMS_PROVIDER` | SMS provider (`twilio`) |
| `SMS_API_KEY` | Twilio Account SID |
| `SMS_API_SECRET` | Twilio Auth Token |
| `SMS_FROM_NUMBER` | Sender phone number |

### Object Storage

| Variable | Description |
|----------|-------------|
| `STORAGE_PROVIDER` | `s3` or `oss` |
| `STORAGE_ENDPOINT` | S3/OSS endpoint URL |
| `STORAGE_BUCKET` | Bucket name |
| `STORAGE_ACCESS_KEY` | Access key |
| `STORAGE_SECRET_KEY` | Secret key |
| `STORAGE_REGION` | Region (e.g. `ap-east-1` for HK) |
| `STORAGE_CDN_URL` | CDN domain for public assets |

### Push Notifications

| Variable | Description |
|----------|-------------|
| `PUSH_APN_KEY` | Apple APNs auth key (.p8 content) |
| `PUSH_APN_KEY_ID` | APNs key ID |
| `PUSH_APN_TEAM_ID` | Apple Developer Team ID |
| `PUSH_FCM_SERVER_KEY` | Firebase Cloud Messaging key |
| `PUSH_HMS_APP_ID` | Huawei HMS app ID |
| `PUSH_HMS_APP_SECRET` | Huawei HMS app secret |

### Data Sync

| Variable | Description |
|----------|-------------|
| `GROUP_DATA_CENTER_URL` | Group data center API endpoint |
| `GROUP_DATA_CENTER_API_KEY` | Authentication key |
| `DATA_SYNC_INTERVAL_MINUTES` | Sync frequency (default: `30`) |

---

## Nginx Configuration

The included `nginx/nginx.conf` provides:

- SSL termination with HTTP/2
- Reverse proxy to backend API and admin portals
- Gzip compression for static assets
- WebSocket support for real-time updates
- Security headers (HSTS, X-Frame-Options, CSP)

### Recommended Domain Setup

| Domain | Upstream |
|--------|----------|
| `api.membership.linkreit.com` | Backend (port 3000) |
| `admin.membership.linkreit.com` | Group Admin (port 3001) |
| `mall.membership.linkreit.com` | Mall Admin (port 3002) |
| `merchant.membership.linkreit.com` | Merchant Portal (port 3003) |
| `m.membership.linkreit.com` | Customer H5 (port 3004) |

---

## Database Backup

### Automated backup (cron)

```bash
# Add to crontab — daily backup at 2:00 AM
0 2 * * * docker exec link-reit-postgres pg_dump -U postgres link_reit_membership | gzip > /backups/membership_$(date +\%Y\%m\%d).sql.gz
```

### Manual backup

```bash
docker exec link-reit-postgres pg_dump -U postgres link_reit_membership > backup.sql
```

### Restore

```bash
docker exec -i link-reit-postgres psql -U postgres link_reit_membership < backup.sql
```

---

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Change PostgreSQL password from default
- [ ] Set `NODE_ENV=production`
- [ ] Configure SSL certificates for Nginx
- [ ] Set `CORS_ORIGINS` to actual domain list
- [ ] Configure SMS provider (Twilio) credentials
- [ ] Configure M365 AD for admin SSO
- [ ] Configure object storage for file uploads
- [ ] Set up push notification credentials (APNs, FCM, HMS)
- [ ] Configure SMTP for email notifications
- [ ] Set up automated database backups
- [ ] Configure log aggregation (ELK / CloudWatch)
- [ ] Set up monitoring and alerting
- [ ] Enable rate limiting for public endpoints
- [ ] Review and test firewall rules
- [ ] Run security scan (OWASP ZAP / similar)

---

## Monitoring

### Health Check

The backend exposes a health endpoint:

```
GET /api/health
```

### Logs

```bash
# View backend logs
docker logs -f link-reit-backend

# View all service logs
docker-compose logs -f

# View specific service
docker-compose logs -f postgres
```

### Prisma Studio (Database GUI)

```bash
# Local development
pnpm db:studio
# Opens browser at http://localhost:5555
```

---

## Scaling Considerations

For high-traffic production deployments:

1. **Database**: Use managed PostgreSQL (AWS RDS / Azure Database for PostgreSQL) with read replicas
2. **Redis**: Use managed Redis (ElastiCache / Azure Cache for Redis) with cluster mode
3. **Backend**: Run multiple instances behind a load balancer; Bull queues support multi-worker processing
4. **Static assets**: Serve admin portal builds from CDN (CloudFront / Azure CDN)
5. **File storage**: Use S3 / OSS with CDN for uploaded images and receipts
6. **Monitoring**: Integrate with APM tool (DataDog, New Relic, or Azure Application Insights)
