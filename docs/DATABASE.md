# Database Guide

Comprehensive guide for database management, migrations, backups, and best practices.

## Table of Contents

1. [Connection Setup](#connection-setup)
2. [Migrations](#migrations)
3. [Rollback Strategy](#rollback-strategy)
4. [Backup & Recovery](#backup--recovery)
5. [Soft Deletes](#soft-deletes)
6. [Connection Pooling](#connection-pooling)
7. [Performance](#performance)

---

## Connection Setup

### Environment Variables

```bash
# .env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

# For connection pooling (Neon, Supabase, PlanetScale)
# Use pooled connection for application
DATABASE_URL="postgresql://user:password@pooler.host:6543/dbname?pgbouncer=true"

# Use direct connection for migrations only
DIRECT_URL="postgresql://user:password@direct.host:5432/dbname"
```

### Provider-Specific Setup

#### Neon (Recommended for Vercel)

```bash
# Pooled connection (for app)
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"

# Direct connection (for migrations)
DIRECT_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
```

#### Supabase

```bash
# Transaction pooler (port 6543)
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (port 5432)
DIRECT_URL="postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

#### Railway

```bash
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
```

---

## Migrations

### Basic Commands

```bash
# Create a new migration (development)
pnpm prisma migrate dev --name add_user_profile

# Apply migrations (production)
pnpm prisma migrate deploy

# Check migration status
pnpm prisma migrate status

# Reset database (DESTRUCTIVE - dev only)
pnpm prisma migrate reset
```

### Migration Workflow

```
1. Modify schema.prisma
2. Run: pnpm prisma migrate dev --name descriptive_name
3. Review generated SQL in prisma/migrations/
4. Commit migration files
5. Deploy: migrations run automatically via build script
```

### Migration Best Practices

| Do | Don't |
|----|-------|
| Use descriptive names: `add_user_avatar_column` | Use vague names: `update_schema` |
| One logical change per migration | Multiple unrelated changes |
| Test migrations on staging first | Deploy directly to production |
| Keep migrations small and reversible | Large, complex migrations |
| Commit migration files to git | Edit existing migration files |

### Safe Schema Changes

**Safe (no downtime):**
- Adding nullable columns
- Adding tables
- Adding indexes (use `CONCURRENTLY` for large tables)
- Adding constraints with `NOT VALID`

**Requires care:**
- Adding non-nullable columns (need default)
- Renaming columns (use multi-step)
- Removing columns (deploy in phases)

**Multi-step column rename:**
```sql
-- Migration 1: Add new column
ALTER TABLE users ADD COLUMN full_name TEXT;
UPDATE users SET full_name = name;

-- Deploy code that writes to both columns

-- Migration 2: Make new column not null
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;

-- Deploy code that only reads from new column

-- Migration 3: Drop old column
ALTER TABLE users DROP COLUMN name;
```

---

## Rollback Strategy

### Understanding Prisma Migrations

Prisma migrations are **forward-only** by default. Rollbacks require manual intervention.

### Rollback Options

#### Option 1: Revert Migration (Recommended)

Create a new migration that undoes the changes:

```bash
# Original migration: add_status_column
# Rollback migration: remove_status_column

pnpm prisma migrate dev --name remove_status_column
```

```sql
-- prisma/migrations/xxx_remove_status_column/migration.sql
ALTER TABLE "Project" DROP COLUMN "status";
```

#### Option 2: Database Restore

For critical failures, restore from backup:

```bash
# Restore from backup (provider-specific)
# Then reset Prisma migration state
pnpm prisma migrate resolve --rolled-back "20240115_add_status_column"
```

#### Option 3: Manual SQL Rollback

For urgent production fixes:

```sql
-- Connect to database directly
-- Undo the migration manually
ALTER TABLE "Project" DROP COLUMN "status";

-- Mark migration as rolled back
DELETE FROM "_prisma_migrations"
WHERE migration_name = '20240115123456_add_status_column';
```

### Rollback Checklist

Before deploying any migration, document the rollback:

```markdown
## Migration: add_payment_status

### Changes
- Add `paymentStatus` column to Orders table
- Add index on `paymentStatus`

### Rollback SQL
```sql
DROP INDEX IF EXISTS "Orders_paymentStatus_idx";
ALTER TABLE "Orders" DROP COLUMN IF EXISTS "paymentStatus";
```

### Rollback Steps
1. Deploy previous code version
2. Run rollback SQL
3. Mark migration as rolled back in _prisma_migrations
```

### Creating Rollback Scripts

Store rollback scripts alongside migrations:

```
prisma/migrations/
├── 20240115_add_payment_status/
│   ├── migration.sql      # Forward migration
│   └── rollback.sql       # Rollback script (manual)
```

---

## Backup & Recovery

### Backup Strategy

| Environment | Frequency | Retention | Method |
|-------------|-----------|-----------|--------|
| Production | Daily + before migrations | 30 days | Automated |
| Staging | Daily | 7 days | Automated |
| Development | Manual | As needed | pg_dump |

### Automated Backups by Provider

#### Neon
- Automatic point-in-time recovery (PITR)
- 7-day history on free tier, 30 days on paid
- Restore via dashboard or API

#### Supabase
- Daily backups on Pro plan
- Point-in-time recovery on Team plan
- Restore via dashboard

#### Railway
- Daily backups included
- Restore via dashboard

#### Self-Hosted
```bash
# Daily backup cron job
0 2 * * * pg_dump -Fc $DATABASE_URL > /backups/db_$(date +\%Y\%m\%d).dump

# Keep 30 days
find /backups -name "db_*.dump" -mtime +30 -delete
```

### Manual Backup Commands

```bash
# Full backup (custom format, compressed)
pg_dump -Fc -v -d "$DATABASE_URL" -f backup.dump

# Full backup (plain SQL)
pg_dump -d "$DATABASE_URL" -f backup.sql

# Schema only
pg_dump -s -d "$DATABASE_URL" -f schema.sql

# Data only
pg_dump -a -d "$DATABASE_URL" -f data.sql

# Specific tables
pg_dump -t users -t projects -d "$DATABASE_URL" -f partial.dump
```

### Recovery Commands

```bash
# Restore from custom format
pg_restore -v -d "$DATABASE_URL" backup.dump

# Restore from SQL
psql -d "$DATABASE_URL" -f backup.sql

# Restore specific tables
pg_restore -t users -t projects -d "$DATABASE_URL" backup.dump
```

### Pre-Migration Backup Script

Create `scripts/backup-before-migrate.sh`:

```bash
#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/pre_migration_${TIMESTAMP}.dump"

echo "Creating backup before migration..."
mkdir -p backups
pg_dump -Fc -v -d "$DATABASE_URL" -f "$BACKUP_FILE"

echo "Backup created: $BACKUP_FILE"
echo "Running migration..."
pnpm prisma migrate deploy

echo "Migration complete!"
echo "To rollback: pg_restore -v -d \"\$DATABASE_URL\" $BACKUP_FILE"
```

### Disaster Recovery Plan

1. **Identify the issue**
   - Check error logs
   - Identify affected data

2. **Stop the bleeding**
   - Enable maintenance mode
   - Stop writes if necessary

3. **Assess damage**
   - Determine data loss extent
   - Identify last good backup

4. **Execute recovery**
   ```bash
   # Option A: Point-in-time recovery (if available)
   # Use provider dashboard

   # Option B: Restore from backup
   pg_restore -v -c -d "$DATABASE_URL" backup.dump
   ```

5. **Verify recovery**
   - Check data integrity
   - Run application tests
   - Verify user-facing functionality

6. **Post-mortem**
   - Document what happened
   - Update procedures
   - Implement preventive measures

---

## Soft Deletes

### When to Use Soft Deletes

**Use soft deletes for:**
- User-generated content (notes, posts, comments)
- Business entities (projects, orders, customers)
- Data with audit requirements
- Anything that might need "undo"

**Don't use soft deletes for:**
- Session data
- Authentication tokens
- Temporary/cache data
- Log/audit tables (use retention policies instead)
- High-volume transient data

### Current Schema Patterns

```prisma
// ✅ Soft delete - user content
model Note {
  deletedAt DateTime?  // Soft delete
}

// ✅ Soft delete - business entity
model Project {
  deletedAt DateTime?  // Soft delete
}

// ✅ NO soft delete - observability (use retention)
model ErrorLog {
  // No deletedAt - use scheduled cleanup instead
}

// ✅ NO soft delete - auth tokens
model Session {
  // No deletedAt - hard delete on logout
}
```

### Implementing Soft Deletes

```typescript
import { prisma, softDelete, notDeleted } from '@/lib/prisma';

// Query non-deleted records
const notes = await prisma.note.findMany({
  where: {
    userId: user.id,
    ...notDeleted,  // { deletedAt: null }
  },
});

// Soft delete a record
await prisma.note.update({
  where: { id: noteId },
  data: softDelete,  // { deletedAt: new Date() }
});

// Hard delete (when appropriate)
await prisma.session.delete({
  where: { id: sessionId },
});
```

### Querying Deleted Records

```typescript
// Find deleted records (for admin/recovery)
const deletedNotes = await prisma.note.findMany({
  where: {
    userId: user.id,
    deletedAt: { not: null },
  },
});

// Restore a soft-deleted record
await prisma.note.update({
  where: { id: noteId },
  data: { deletedAt: null },
});
```

### Data Retention

For tables without soft deletes, implement scheduled cleanup:

```typescript
// Clean up old error logs (keep 90 days)
async function cleanupErrorLogs() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);

  const result = await prisma.errorLog.deleteMany({
    where: {
      timestamp: { lt: cutoff },
      resolved: true,
    },
  });

  console.log(`Cleaned up ${result.count} old error logs`);
}

// Clean up old performance metrics (keep 30 days)
async function cleanupMetrics() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  await prisma.performanceMetric.deleteMany({
    where: {
      timestamp: { lt: cutoff },
    },
  });
}
```

---

## Connection Pooling

### Why Connection Pooling?

Serverless functions create new connections per invocation. Without pooling:
- Connection limits exhausted quickly
- Slow cold starts
- Database overwhelmed

### Pooling Options

#### 1. Prisma Accelerate (Managed)

```bash
# Use Prisma Accelerate URL
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=xxx"

# Keep direct URL for migrations
DIRECT_URL="postgresql://user:password@host:5432/dbname"
```

#### 2. Provider Pooling (Neon, Supabase)

```prisma
// schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Pooled
  directUrl = env("DIRECT_URL")        // Direct (migrations)
}
```

#### 3. PgBouncer (Self-Hosted)

```bash
# pgbouncer.ini
[databases]
mydb = host=localhost dbname=mydb

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
```

### Connection Configuration

The template's `lib/prisma.ts` is pre-configured for serverless:

```typescript
const prismaClientOptions = {
  // Transaction settings for serverless
  transactionOptions: {
    maxWait: 5000,   // Max wait for transaction slot
    timeout: 10000,  // Max transaction duration
  },
};
```

### Monitoring Connections

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'your_db';

-- See connection details
SELECT pid, usename, application_name, state, query_start
FROM pg_stat_activity
WHERE datname = 'your_db';
```

---

## Performance

### Indexing Strategy

```prisma
model Note {
  id        String    @id @default(cuid())
  userId    String
  deletedAt DateTime?
  pinned    Boolean   @default(false)
  createdAt DateTime  @default(now())

  // Indexes for common queries
  @@index([userId])           // Find user's notes
  @@index([deletedAt])        // Filter deleted
  @@index([pinned])           // Sort by pinned
  @@index([userId, deletedAt, pinned])  // Composite for list query
}
```

### Query Optimization

```typescript
// ❌ Bad: Select all columns
const notes = await prisma.note.findMany();

// ✅ Good: Select only needed columns
const notes = await prisma.note.findMany({
  select: {
    id: true,
    title: true,
    pinned: true,
  },
});

// ❌ Bad: N+1 queries
const notes = await prisma.note.findMany();
for (const note of notes) {
  const user = await prisma.user.findUnique({ where: { id: note.userId } });
}

// ✅ Good: Include related data
const notes = await prisma.note.findMany({
  include: {
    user: {
      select: { name: true, email: true },
    },
  },
});
```

### Analyzing Slow Queries

```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 100;  -- Log queries > 100ms

-- Find slow queries
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## Seed Data

The template includes environment-specific seeding:

```bash
# Seed for development (full data)
pnpm db:seed:dev

# Seed for staging (moderate data)
pnpm db:seed:staging

# Seed for production (minimal/none)
pnpm db:seed:prod
```

See `prisma/seeds/` for seed data structure.

---

## Quick Reference

### Common Commands

```bash
# Development
pnpm prisma migrate dev --name description  # Create migration
pnpm prisma studio                           # Visual editor
pnpm db:seed                                 # Seed database

# Production
pnpm prisma migrate deploy                   # Apply migrations
pnpm prisma migrate status                   # Check status

# Troubleshooting
pnpm prisma migrate reset                    # Reset (DESTRUCTIVE)
pnpm prisma db pull                          # Sync schema from DB
pnpm prisma generate                         # Regenerate client
```

### Environment Checklist

- [ ] `DATABASE_URL` set (pooled connection)
- [ ] `DIRECT_URL` set (direct connection for migrations)
- [ ] Backups configured
- [ ] Monitoring enabled
- [ ] Retention policies defined
