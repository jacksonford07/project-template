# ADR-004: Internal/Sync API Pattern

## Status

Accepted

## Context

The application needs to:
- Serve data to the frontend efficiently
- Integrate with external APIs
- Handle caching and data freshness
- Provide clear API boundaries

We need a consistent pattern for organizing API routes.

## Decision

Organize API routes into three categories:

```
/api/
├── internal/     # Database-first, internal operations
├── sync/         # External API integration with caching
└── auth/         # Authentication endpoints (NextAuth)
```

### Internal Routes (`/api/internal/*`)

- Primary data source is the database
- Used by the application frontend
- Fast, cached when appropriate
- No external API calls

### Sync Routes (`/api/sync/*`)

- Integrate with external services
- Database-first with external fallback
- Handle stale data gracefully
- Background refresh when needed

## Consequences

### Positive

- **Clear boundaries**: Easy to understand what each route does
- **Predictable behavior**: Internal routes are always fast
- **Graceful degradation**: External failures don't break the app
- **Cache efficiency**: Smart caching based on data type
- **Testing simplicity**: Mock external calls without affecting internal

### Negative

- **More route files**: Three directories instead of one
- **Sync complexity**: Need to handle cache invalidation
- **Duplication risk**: Similar logic in internal vs sync routes

### Neutral

- Requires team agreement on which category for new routes
- Documentation needed for the pattern

## Implementation

### Internal Route Example

```typescript
// /api/internal/users/route.ts
export async function GET() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null }
  });
  return Response.json(users);
}
```

### Sync Route Example

```typescript
// /api/sync/weather/route.ts
export async function GET() {
  // 1. Check database cache
  const cached = await prisma.weatherCache.findFirst({
    where: { location: 'default' }
  });

  // 2. Return if fresh
  if (cached && !isStale(cached.updatedAt, 60)) {
    return Response.json(cached.data);
  }

  // 3. Fetch from external API
  try {
    const fresh = await fetchWeatherAPI();

    // 4. Update cache
    await prisma.weatherCache.upsert({
      where: { location: 'default' },
      update: { data: fresh, updatedAt: new Date() },
      create: { location: 'default', data: fresh }
    });

    return Response.json(fresh);
  } catch (error) {
    // 5. Return stale data on failure
    if (cached) return Response.json(cached.data);
    throw error;
  }
}
```

## Alternatives Considered

### Single API Directory

All routes in `/api/*`. Rejected because:
- No clear distinction between internal and external
- Harder to apply different caching strategies
- Mixed concerns

### BFF (Backend for Frontend)

Separate backend service. Rejected because:
- Overkill for most applications
- Additional deployment complexity
- Next.js API routes sufficient

### GraphQL

Single endpoint with queries. Rejected because:
- Additional complexity
- Learning curve
- REST simpler for this use case

## References

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Stale-While-Revalidate Pattern](https://web.dev/stale-while-revalidate/)
