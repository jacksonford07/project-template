# ADR-003: Implement Soft Deletes

## Status

Accepted

## Context

When users or systems delete data, we need to decide between:
- **Hard delete**: Permanently remove from database
- **Soft delete**: Mark as deleted but retain data

This affects data recovery, auditing, and referential integrity.

## Decision

Implement soft deletes for all user-facing data models using a `deletedAt` timestamp column.

```prisma
model User {
  id        String    @id @default(cuid())
  // ... other fields
  deletedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

## Consequences

### Positive

- **Data recovery**: Accidentally deleted data can be restored
- **Audit trail**: Historical record of what existed
- **Referential integrity**: Foreign keys remain valid
- **Compliance**: Meet data retention requirements
- **Analytics**: Include deleted records in historical reports
- **Undo functionality**: Enable user-facing "undo delete"

### Negative

- **Query complexity**: Must filter `deletedAt: null` in all queries
- **Storage growth**: Deleted data still consumes space
- **Index overhead**: Soft-deleted records still in indexes
- **GDPR complexity**: True deletion requires additional handling

### Neutral

- Requires discipline to always include filter
- Can create helper functions to abstract the pattern

## Implementation

### Standard Query Pattern

```typescript
// Always filter out deleted records
const users = await prisma.user.findMany({
  where: { deletedAt: null }
});

// Soft delete operation
await prisma.user.update({
  where: { id },
  data: { deletedAt: new Date() }
});

// Hard delete (when truly needed, e.g., GDPR)
await prisma.user.delete({ where: { id } });
```

### Helper Pattern

```typescript
// lib/prisma-helpers.ts
export const notDeleted = { deletedAt: null };
export const softDelete = { deletedAt: new Date() };

// Usage
const users = await prisma.user.findMany({
  where: notDeleted
});
```

## Alternatives Considered

### Hard Deletes Only

Simpler implementation. Rejected because:
- No data recovery possible
- Breaks foreign key references
- No audit history

### Separate Archive Tables

Move deleted records to archive tables. Rejected because:
- Complex migration logic
- Queries across tables difficult
- More maintenance overhead

### Event Sourcing

Store all changes as events. Rejected because:
- Significant architectural change
- Overkill for most use cases
- Steep learning curve

## References

- [Prisma Soft Delete Middleware](https://www.prisma.io/docs/concepts/components/prisma-client/middleware/soft-delete-middleware)
- [Soft Delete Pattern](https://en.wikibooks.org/wiki/Big_Data_Management/Data_Persistence/Soft_Delete)
