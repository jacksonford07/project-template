# Project Instructions for AI Assistants

This document provides essential context and rules for AI assistants (Claude, Cursor, etc.) working on this project.

## Project Overview

This is a Next.js 15 project with TypeScript, Prisma ORM, and NextAuth for authentication. It follows strict coding standards and patterns designed for maintainability and reliability.

**This project uses the BMAD Method** - an AI-driven agile development framework with specialized agents.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth v5
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Testing Library
- **Package Manager**: pnpm
- **AI Workflow**: BMAD Method

---

## BMAD Method Integration

### What is BMAD?
BMAD (Breakthrough Method for Agile AI-Driven Development) provides specialized AI agents for different development phases. Each agent has a specific role and expertise.

### Available Agents

| Agent | Command | Purpose |
|-------|---------|---------|
| **Dev (Amelia)** | `/bmad/dev` | Implement stories with TDD |
| **Architect (Winston)** | `/bmad/architect` | System design & architecture |
| **PM (Sarah)** | `/bmad/pm` | Product requirements & stories |
| **Quick Flow** | `/bmad/quick-flow` | Rapid small feature dev |
| **Analyst (Maya)** | `/bmad/analyst` | Requirements elicitation |
| **Scrum Master (Alex)** | `/bmad/sm` | Sprint facilitation |
| **Test Architect (Quinn)** | `/bmad/test-architect` | Testing strategy |

### Workflow Tracks

#### Quick Flow (< 5 min)
For: Bug fixes, small features, refactoring
```
User: /bmad/quick-flow
User: Fix the login redirect bug
```

#### Standard Flow (< 15 min)
For: Medium features requiring planning
```
1. /bmad/pm → Create story
2. /bmad/architect → Design solution
3. /bmad/dev → Implement
```

#### Enterprise Flow (< 30 min)
For: Large features, new systems
```
1. /bmad/analyst → Requirements
2. /bmad/pm → PRD & stories
3. /bmad/architect → Architecture
4. /bmad/dev → Implementation
5. /bmad/test-architect → Test strategy
```

### Project Context

All agents reference: `web/docs/bmad/project-context.md`

**Update this file** with:
- Tech stack decisions
- Architecture patterns
- Coding standards
- Known constraints

---

## Critical Rules

### 1. ALWAYS Read Before Modifying

**Before making ANY changes to a file:**
- Read the ENTIRE file first
- Understand the current implementation
- Check for dependencies and usage patterns
- Never make blind search/replace changes

### 2. DRY - Don't Repeat Yourself

**Before creating new code:**
- Check `components/ui/` for existing components
- Check `lib/` for existing utilities
- Search for similar patterns in the codebase
- Reuse before creating

### 3. TypeScript Requirements

- **NO `any` types** - be explicit with types
- **NO non-null assertions (`!`)** - handle null cases properly
- **Handle promises properly** - no floating promises
- **Use modern operators** - `?.` and `??`
- **Add return types** to all functions

### 4. Database Rules

- **ALWAYS use soft deletes** - set `deletedAt` instead of hard deleting
- **Use `prisma migrate dev`** for schema changes, never `db push`
- **Include timestamps** - `createdAt`, `updatedAt`, `deletedAt` on all tables

### 5. API Architecture

- **Primary routes**: `/api/internal/*` - Database-first with caching
- **Sync routes**: `/api/sync/*` - Explicit sync operations
- **External routes**: `/api/[external]/*` - Direct API proxies
- **Always check database first**, external API as fallback

### 6. Logging

Use the centralized logger, not `console`:

```typescript
import { logger } from '@/lib/logger';

logger.info('Context', 'Message', { data });
logger.error('Context', 'Message', error, { data });
logger.success('Context', 'Message', { data });
```

### 7. Git Workflow

- **Conventional commits**: `feat(scope): message`, `fix(scope): message`
- **DO NOT push** without explicit instruction
- **One change at a time** - test after each change

---

## Project Structure

```
project/
├── .claude/commands/bmad/    # Claude Code BMAD agents
├── .cursor/rules/bmad/       # Cursor BMAD agents
├── .github/workflows/        # CI/CD
├── web/
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   │   └── api/
│   │   │       ├── internal/ # Database-first routes
│   │   │       └── sync/     # Sync operations
│   │   ├── components/ui/    # Reusable UI
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities & services
│   │   ├── styles/           # Style constants
│   │   └── types/            # TypeScript types
│   ├── docs/bmad/
│   │   └── project-context.md  # BMAD project context
│   └── prisma/               # Database schema
└── CLAUDE.md                 # This file
```

---

## Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript check
pnpm test             # Run tests
pnpm validate         # Lint + type-check

# Database
pnpm prisma migrate dev --name description
pnpm prisma studio
pnpm db:seed

# Build & CI
pnpm build
pnpm ci:all           # Run full CI locally
```

---

## Commit Message Format

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert
```

Examples:
- `feat(auth): add oauth2 login support`
- `fix(api): resolve memory leak in processor`
- `docs(readme): update installation steps`

---

## What NOT to Do

1. **Don't delete files** without checking dependencies first
2. **Don't make many changes at once** - one change, then test
3. **Don't use `any` types** - be explicit
4. **Don't hardcode values** - use constants and configs
5. **Don't create new utilities** without checking for existing ones
6. **Don't push** without explicit approval
7. **Don't skip BMAD workflow** for non-trivial features

## What TO Do

1. **Read files** before modifying them
2. **Use BMAD agents** for structured development
3. **Update project-context.md** with decisions
4. **Use the logger** for all logging needs
5. **Follow database-first** pattern for APIs
6. **Use conventional commits** for all commits
7. **Test incrementally** after each change
