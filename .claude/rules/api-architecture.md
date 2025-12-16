# API Architecture

## Route Structure

### Internal Routes (`/api/internal/*`)
Database-first operations. Used by the application.

```typescript
// /api/internal/users/route.ts
export async function GET() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null }
  });
  return NextResponse.json(users);
}
```

### Sync Routes (`/api/sync/*`)
External service integration with fallback.

```typescript
// /api/sync/analytics/route.ts
export async function GET() {
  // Try database first
  const cached = await getFromCache();
  if (cached && !isStale(cached)) {
    return NextResponse.json(cached);
  }

  // Fallback to external
  const fresh = await fetchExternal();
  await updateCache(fresh);
  return NextResponse.json(fresh);
}
```

## Smart Sync Pattern

### Database First, External Fallback

```typescript
async function getData(id: string) {
  // 1. Check database
  const cached = await prisma.data.findUnique({ where: { id } });

  // 2. Return if fresh
  if (cached && !isStale(cached.updatedAt)) {
    return cached;
  }

  // 3. Fetch from external
  try {
    const fresh = await externalApi.fetch(id);

    // 4. Update cache
    await prisma.data.upsert({
      where: { id },
      update: { ...fresh, updatedAt: new Date() },
      create: { id, ...fresh }
    });

    return fresh;
  } catch (error) {
    // 5. Return stale data if external fails
    if (cached) return cached;
    throw error;
  }
}
```

### Stale Data Handling

| Data Type | Stale After | Action |
|-----------|-------------|--------|
| Current-day data | Always | Always refresh |
| Historical data | Never | Cache forever |
| User preferences | 24 hours | Background refresh |
| Analytics | 1 hour | Refresh on access |

```typescript
function isStale(data: { date: Date; updatedAt: Date }): boolean {
  const isToday = isSameDay(data.date, new Date());

  // Current day is always stale
  if (isToday) return true;

  // Historical data is never stale
  return false;
}
```

## DRY API Handlers

### Reusable Handler Pattern

```typescript
// lib/api/handler.ts
export function createHandler<T>(
  handler: (req: Request) => Promise<T>
) {
  return async (req: Request) => {
    try {
      const result = await handler(req);
      return NextResponse.json(result);
    } catch (error) {
      logger.error('API Error', { error });
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}

// Usage
export const GET = createHandler(async (req) => {
  return prisma.user.findMany();
});
```

## Logging Standards

### Use Centralized Logger

```typescript
import { logger } from '@/lib/logger';

// Don't use console.log directly
// BAD
console.log('User created');

// GOOD
logger.info('User created', { userId, email });
```

### Log Levels

| Level | Use For |
|-------|---------|
| `error` | Failures requiring attention |
| `warn` | Unexpected but handled situations |
| `info` | Important operations |
| `debug` | Development details |

### Context Naming
```typescript
// Include component/function context
logger.info('[UserService] Creating user', { email });
logger.error('[PaymentAPI] Payment failed', { userId, error });
```
