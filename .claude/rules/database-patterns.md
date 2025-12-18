# Database Patterns & Prisma

## Schema Conventions

### Soft Deletes (When Appropriate)

**USE soft deletes for:**
- User-generated content (notes, posts, comments)
- Business entities (projects, orders, customers)
- Data with audit/compliance requirements
- Anything users might want to "undo"

```prisma
model Note {
  id        String    @id @default(cuid())
  title     String
  deletedAt DateTime?  // Soft delete
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

**DON'T use soft deletes for:**
- Session/token data (hard delete on expiry)
- Log/audit tables (use retention policies)
- Cache/temporary data
- High-volume transient data

```prisma
// NO soft delete - use scheduled cleanup instead
model ErrorLog {
  id        Int      @id @default(autoincrement())
  timestamp DateTime @default(now())
  // ... no deletedAt
}
```

See `docs/DATABASE.md` for complete soft delete patterns.

### Standard Timestamps
Every model should have:
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`

### Junction Tables
For many-to-many relationships:

```prisma
model UserRole {
  id        String   @id @default(cuid())
  userId    String
  roleId    String
  user      User     @relation(fields: [userId], references: [id])
  role      Role     @relation(fields: [roleId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, roleId])
}
```

## Prisma Migration Workflow

### CRITICAL: Always Use `migrate dev`

```bash
# WRONG - No migration file created
pnpm prisma db push

# CORRECT - Creates migration file
pnpm prisma migrate dev --name descriptive_name
```

### Migration Examples
```bash
pnpm prisma migrate dev --name add_user_table
pnpm prisma migrate dev --name add_deleted_at_column
pnpm prisma migrate dev --name create_junction_tables
```

### When to Use Each Command

| Command | Use For |
|---------|---------|
| `prisma migrate dev` | All schema changes (primary) |
| `prisma db push` | Quick experiments only (never commit) |
| `prisma migrate deploy` | Production (automatic via build) |

### Migration Best Practices

1. **Descriptive Names**
   ```bash
   # Good
   pnpm prisma migrate dev --name add_subscriber_history_table

   # Bad
   pnpm prisma migrate dev --name update
   ```

2. **One Logical Change Per Migration**
   - Migration 1: Add User table
   - Migration 2: Add soft delete columns
   - NOT: Migration 1: Add 3 tables, remove 2 columns, change indexes

3. **Never Edit Migration Files**
   Once created, migration files are immutable. Create new migrations to fix issues.

## Query Patterns

### Soft Delete Queries
```typescript
// Always exclude deleted records
const users = await prisma.user.findMany({
  where: { deletedAt: null }
});

// Soft delete operation
await prisma.user.update({
  where: { id },
  data: { deletedAt: new Date() }
});
```

### Include vs Select
```typescript
// Use select for specific fields (better performance)
const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, name: true, email: true }
});

// Use include for relations
const userWithPosts = await prisma.user.findUnique({
  where: { id },
  include: { posts: true }
});
```
