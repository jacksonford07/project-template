# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for this project.

## What is an ADR?

An ADR is a document that captures an important architectural decision made along with its context and consequences.

## ADR Index

| ID | Title | Status | Date |
|----|-------|--------|------|
| [001](001-nextjs-app-router.md) | Use Next.js 15 App Router | Accepted | 2024-01 |
| [002](002-prisma-orm.md) | Use Prisma as ORM | Accepted | 2024-01 |
| [003](003-soft-deletes.md) | Implement Soft Deletes | Accepted | 2024-01 |
| [004](004-api-architecture.md) | Internal/Sync API Pattern | Accepted | 2024-01 |
| [005](005-testing-strategy.md) | Testing Strategy | Accepted | 2024-01 |
| [006](006-authentication.md) | NextAuth v5 for Authentication | Accepted | 2024-01 |

## Creating a New ADR

1. Copy the template: `cp docs/adr/template.md docs/adr/NNN-title.md`
2. Fill in the sections
3. Update this index
4. Commit with: `docs(adr): add ADR-NNN title`

## ADR Statuses

- **Proposed**: Under discussion
- **Accepted**: Decision made and implemented
- **Deprecated**: No longer valid, superseded
- **Superseded**: Replaced by another ADR
