# Project Context

This document is the **single source of truth** for project standards, patterns, and decisions. All BMAD agents reference this file.

## Project Overview

**Name**: [Your Project Name]
**Description**: [Brief description of what this project does]
**Status**: [Planning | Development | Production]

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 15.x |
| Language | TypeScript | 5.x |
| Database | PostgreSQL | 16.x |
| ORM | Prisma | 6.x |
| Auth | NextAuth | 5.x |
| Styling | Tailwind CSS | 3.x |
| Testing | Vitest | 2.x |
| Package Manager | pnpm | 9.x |

## Architecture Decisions

### API Architecture
- **Primary routes**: `/api/internal/*` - Database-first with caching
- **Sync routes**: `/api/sync/*` - External API synchronization
- **Pattern**: Check database first, external API as fallback

### Database Patterns
- **Soft deletes**: Always use `deletedAt` instead of hard deletes
- **Timestamps**: All tables have `createdAt`, `updatedAt`, `deletedAt`
- **IDs**: Use CUID for primary keys

### State Management
- React Context for global state
- Server Components where possible
- Client Components only when needed (interactivity)

## Coding Standards

### TypeScript
- Strict mode enabled
- No `any` types
- No non-null assertions (`!`)
- Explicit return types on functions
- Use `?.` and `??` operators

### File Organization
```
src/
├── app/          # Next.js routes
├── components/   # React components
│   └── ui/       # Reusable UI
├── contexts/     # React contexts
├── hooks/        # Custom hooks
├── lib/          # Utilities
│   ├── api/      # API middleware & handlers
│   └── features/ # Optional features (i18n, PWA, etc.)
├── styles/       # Style constants
└── types/        # TypeScript types
```

### Naming Conventions
- **Files**: kebab-case (`user-service.ts`)
- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions**: camelCase (`getUserById`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Types/Interfaces**: PascalCase (`UserProfile`)

### Import Order
1. External libraries
2. Internal modules (`@/lib/*`)
3. Relative imports

## API Patterns

### Route Handler Template
```typescript
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await requireAuth(req);
    logger.info('Context', 'Action', { userId });

    const data = await prisma.model.findMany({
      where: { deletedAt: null }
    });

    return NextResponse.json({ data });
  } catch (error) {
    logger.error('Context', 'Failed', error as Error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Error Handling
- Use centralized logger for all errors
- Return consistent error response format
- Never expose internal error details to clients

## Testing Standards

### Test Structure
- Co-locate tests with source files (`*.test.ts`)
- Use Arrange-Act-Assert pattern
- One concept per test

### Coverage Targets
- Unit tests: 70% minimum
- Integration tests: 50% minimum
- E2E: Critical user journeys

## Git Conventions

### Commit Messages
```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, perf, test, chore
```

### Branch Naming
- `feature/[description]`
- `fix/[description]`
- `refactor/[description]`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| NEXTAUTH_SECRET | Auth encryption key | Yes |
| NEXTAUTH_URL | App base URL | Yes |

## Known Constraints

- [List any technical constraints]
- [List any business constraints]

## External Integrations

| Service | Purpose | Documentation |
|---------|---------|---------------|
| [Service] | [What it's used for] | [Link] |

---

**Last Updated**: [Date]
**Updated By**: [Name/Agent]
