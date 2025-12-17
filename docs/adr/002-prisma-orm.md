# ADR-002: Use Prisma as ORM

## Status

Accepted

## Context

We need a database access layer that provides:
- Type-safe database queries
- Migration management
- Good developer experience
- PostgreSQL support
- Works well with TypeScript

## Decision

Use Prisma ORM with PostgreSQL.

## Consequences

### Positive

- **Full type safety**: Generated TypeScript types from schema
- **Declarative schema**: Easy to read and modify `schema.prisma`
- **Migration system**: Trackable, version-controlled migrations
- **Prisma Studio**: Visual database browser for development
- **Query builder**: Intuitive API for complex queries
- **Relations handling**: Automatic joins and nested queries
- **Active development**: Regular updates and improvements

### Negative

- **Generated client size**: Adds to bundle size
- **Cold starts**: Can be slow on serverless (mitigated by connection pooling)
- **Raw SQL limitations**: Some complex queries need `$queryRaw`
- **Learning curve**: Prisma-specific patterns to learn

### Neutral

- Schema-first approach (vs code-first)
- Requires `prisma generate` after schema changes

## Alternatives Considered

### Drizzle ORM

Newer, lighter ORM with SQL-like syntax. Rejected because:
- Less mature ecosystem
- Fewer learning resources
- Team more familiar with Prisma

### TypeORM

Popular TypeScript ORM. Rejected because:
- More verbose configuration
- Decorator-based (class-heavy)
- Migration system less intuitive

### Knex.js (Query Builder)

Low-level query builder. Rejected because:
- No automatic type generation
- More manual work for relations
- Less developer-friendly for rapid development

### Raw SQL / pg

Direct PostgreSQL driver. Rejected because:
- No type safety
- Manual migration management
- More boilerplate code

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma with Next.js](https://www.prisma.io/nextjs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
