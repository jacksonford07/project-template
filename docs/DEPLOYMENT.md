# Deployment Guide

This guide covers deploying your application to various platforms with proper environment management, observability, and production best practices.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Management](#environment-management)
3. [Platform Guides](#platform-guides)
   - [Vercel](#vercel-recommended)
   - [AWS](#aws)
   - [Google Cloud Platform](#google-cloud-platform)
   - [Self-Hosted](#self-hosted)
4. [Database Setup](#database-setup)
5. [Observability](#observability)
6. [Health Checks](#health-checks)
7. [Deployment Controls](#deployment-controls)

---

## Pre-Deployment Checklist

Before deploying to any environment, verify:

### Security
- [ ] All secrets are in environment variables (not in code)
- [ ] `NEXTAUTH_SECRET` is unique per environment
- [ ] Database credentials are secure and unique per environment
- [ ] No `.env` files committed to git
- [ ] Security headers configured in `next.config.ts`
- [ ] Rate limiting enabled on API routes

### Code Quality
- [ ] All tests passing (`pnpm test`)
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Build succeeds locally (`pnpm build`)

### Database
- [ ] Migrations are up to date
- [ ] Connection pooling configured for serverless
- [ ] Backup strategy in place

### Monitoring
- [ ] Health check endpoints responding
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Logging configured

---

## Environment Management

### Environment Hierarchy

```
┌─────────────────────────────────────────────────┐
│  Production    - Live traffic, real data        │
├─────────────────────────────────────────────────┤
│  Staging       - Pre-production testing         │
├─────────────────────────────────────────────────┤
│  Preview       - PR preview deployments         │
├─────────────────────────────────────────────────┤
│  Development   - Local development              │
└─────────────────────────────────────────────────┘
```

### Environment Variables by Stage

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `NODE_ENV` | development | production | production |
| `DATABASE_URL` | Local/Docker | Staging DB | Production DB |
| `NEXTAUTH_URL` | localhost:3000 | staging.app.com | app.com |
| `NEXTAUTH_SECRET` | dev-secret | staging-secret | prod-secret |

### Creating Environment Files

```bash
# Local development
cp .env.example .env

# For CI/CD, set in platform dashboard or secrets manager
```

### Vercel Environment Configuration

```bash
# Set environment variables per environment
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development
```

---

## Platform Guides

### Vercel (Recommended)

Best for: Most Next.js projects, automatic scaling, preview deployments

#### Initial Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
cd web && vercel link
```

#### Environment Variables

Set in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Environments |
|----------|--------------|
| `DATABASE_URL` | Production, Preview |
| `NEXTAUTH_SECRET` | Production, Preview |
| `NEXTAUTH_URL` | Production (set to your domain) |

#### Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

#### Automatic Deployments

Vercel automatically deploys:
- **Production**: Push to `main` branch
- **Preview**: Push to any other branch or PR

To disable auto-deploy (manual approval):
1. Go to Project Settings → Git
2. Disable "Automatically deploy on push"
3. Use `vercel --prod` for manual deploys

---

### AWS

Best for: Enterprise, existing AWS infrastructure, complex requirements

#### Option 1: AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

#### Option 2: AWS App Runner

1. Push code to ECR or connect GitHub
2. Create App Runner service
3. Configure environment variables
4. Set up custom domain

#### Option 3: EC2 + PM2 (Self-managed)

```bash
# On EC2 instance
git clone <your-repo>
cd web

# Install dependencies
npm install -g pnpm pm2
pnpm install

# Build
pnpm build

# Start with PM2
pm2 start npm --name "nextjs" -- start
pm2 save
pm2 startup
```

#### Database Options

- **RDS PostgreSQL**: Managed, auto-backups
- **Aurora Serverless**: Auto-scaling, pay-per-use
- **Neon**: Serverless PostgreSQL with branching

---

### Google Cloud Platform

Best for: GCP ecosystem, Cloud SQL, global CDN

#### Cloud Run (Recommended)

```bash
# Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/app

# Deploy
gcloud run deploy app \
  --image gcr.io/PROJECT_ID/app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=..." \
  --set-secrets "NEXTAUTH_SECRET=nextauth-secret:latest"
```

#### App Engine

```yaml
# app.yaml
runtime: nodejs20

env_variables:
  NODE_ENV: production

automatic_scaling:
  min_instances: 1
  max_instances: 10
```

```bash
gcloud app deploy
```

#### Database Options

- **Cloud SQL**: Managed PostgreSQL
- **AlloyDB**: PostgreSQL-compatible, high performance

---

### Self-Hosted

Best for: Full control, compliance requirements, on-premise

#### With Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t myapp .
docker run -p 3000:3000 --env-file .env.production myapp
```

#### With systemd

```ini
# /etc/systemd/system/nextjs.service
[Unit]
Description=Next.js Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/app/web
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production
EnvironmentFile=/var/www/app/.env.production

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable nextjs
sudo systemctl start nextjs
```

#### Reverse Proxy (Nginx)

```nginx
# /etc/nginx/sites-available/app
server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Database Setup

### Connection Pooling (Required for Serverless)

For serverless deployments, use connection pooling to prevent exhausting database connections.

#### Option 1: Prisma Accelerate

```bash
# In .env
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=..."
DIRECT_URL="postgresql://..." # For migrations
```

#### Option 2: Neon with Pooling

```bash
# Pooled connection for queries
DATABASE_URL="postgres://...@ep-xxx.us-east-1.aws.neon.tech/db?sslmode=require&pgbouncer=true"

# Direct connection for migrations
DIRECT_URL="postgres://...@ep-xxx.us-east-1.aws.neon.tech/db?sslmode=require"
```

#### Option 3: Supabase with pgBouncer

```bash
# Transaction mode (port 6543)
DATABASE_URL="postgres://...@db.xxx.supabase.co:6543/postgres?pgbouncer=true"

# Session mode for migrations
DIRECT_URL="postgres://...@db.xxx.supabase.co:5432/postgres"
```

### Running Migrations

```bash
# Development
pnpm prisma migrate dev

# Production (in CI/CD or deploy script)
pnpm prisma migrate deploy
```

---

## Observability

### Error Tracking with Sentry

```bash
# Install
pnpm add @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Logging with External Services

#### Axiom

```bash
pnpm add @axiomhq/nextjs
```

```typescript
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('@axiomhq/nextjs');
  }
}
```

#### LogTail/Better Stack

```bash
pnpm add @logtail/next
```

### Application Performance Monitoring (APM)

#### Vercel Analytics (Built-in)

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### DataDog

```bash
pnpm add dd-trace
```

```typescript
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const tracer = await import('dd-trace');
    tracer.default.init();
  }
}
```

---

## Health Checks

The template includes built-in health check endpoints:

### Liveness Check

```
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "checks": {
    "database": "ok"
  }
}
```

### Readiness Check

```
GET /api/health/ready
```

Response:
```json
{
  "ready": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "checks": {
    "database": true,
    "migrations": true
  }
}
```

### Usage in Platform Configurations

#### Vercel
Automatic - Vercel handles health checks internally.

#### AWS App Runner
```yaml
HealthCheckConfiguration:
  Path: /api/health
  Protocol: HTTP
  Interval: 10
  Timeout: 5
```

#### Kubernetes
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## Deployment Controls

### Manual Approval Workflow

For production deployments requiring approval:

#### Vercel

1. **Disable auto-deploy**:
   - Project Settings → Git → Disable "Auto-deploy"

2. **Use GitHub Actions for controlled deploys**:

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  workflow_dispatch:
    inputs:
      confirm:
        description: 'Type "deploy" to confirm'
        required: true

jobs:
  deploy:
    if: github.event.inputs.confirm == 'deploy'
    runs-on: ubuntu-latest
    environment: production  # Requires approval
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

3. **Set up GitHub Environment protection**:
   - Repository Settings → Environments → production
   - Add required reviewers
   - Add deployment branch rules

### Rollback Procedures

#### Vercel
```bash
# List deployments
vercel ls

# Promote previous deployment to production
vercel promote <deployment-url>
```

#### Git-based
```bash
# Revert commit
git revert HEAD
git push origin main

# Or reset to previous state
git reset --hard HEAD~1
git push --force-with-lease origin main
```

### Feature Flags

For gradual rollouts, consider:
- [LaunchDarkly](https://launchdarkly.com)
- [Vercel Edge Config](https://vercel.com/docs/storage/edge-config)
- [Flagsmith](https://flagsmith.com) (open source)

---

## Quick Reference

### Deploy Commands

```bash
# Vercel
vercel              # Preview
vercel --prod       # Production

# Manual build
pnpm build && pnpm start

# Database migrations
pnpm prisma migrate deploy
```

### Environment Variable Template

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://your-domain.com

# Optional - Observability
SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# Optional - Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=xxx
```

### Monitoring Checklist

- [ ] Health checks responding
- [ ] Error tracking receiving events
- [ ] Logs flowing to aggregator
- [ ] Uptime monitoring configured
- [ ] Alerts set up for critical errors
