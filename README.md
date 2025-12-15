# Project Template

A production-ready Next.js 15 project template with TypeScript, Prisma, BMAD Method, and best practices baked in.

## Quick Start

1. **Copy this template** to your new project folder
2. **Update project name** in `web/package.json`
3. **Install dependencies**:
   ```bash
   cd web
   pnpm install
   ```
4. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```
5. **Start database** (if using Docker):
   ```bash
   cd ..
   docker-compose up -d
   ```
6. **Run migrations**:
   ```bash
   cd web
   pnpm prisma migrate dev --name init
   ```
7. **Update project context**:
   ```bash
   # Edit web/docs/bmad/project-context.md with your project details
   ```
8. **Start development**:
   ```bash
   pnpm dev
   ```

## What's Included

### Configuration
- TypeScript strict mode
- ESLint with strict rules
- Prettier formatting
- Commitlint for conventional commits
- Vitest for testing
- Husky + lint-staged for pre-commit hooks

### Core Libraries
- Centralized logger with error tracking
- Prisma client setup
- NextAuth authentication
- Authorization middleware
- Format utilities

### Project Structure
- Database-first API architecture
- Soft deletes by default
- Observability tables (ErrorLog, PerformanceMetric)
- React context providers
- Custom hooks

### CI/CD
- GitHub Actions workflow
- Local CI script
- Standard-version for releases

### AI Assistant Integration
- `.cursor/rules/` - Cursor AI guidelines (10 rules)
- `.cursor/rules/bmad/` - BMAD agents for Cursor
- `.claude/commands/bmad/` - BMAD agents for Claude Code
- `CLAUDE.md` - Claude/AI assistant instructions

---

## BMAD Method

This template integrates the **BMAD Method** (Breakthrough Method for Agile AI-Driven Development) - a framework that provides specialized AI agents for structured development.

### Available Agents

| Agent | Claude Command | Purpose |
|-------|----------------|---------|
| Dev (Amelia) | `/bmad/dev` | TDD implementation |
| Architect (Winston) | `/bmad/architect` | System design |
| PM (Sarah) | `/bmad/pm` | Requirements & stories |
| Quick Flow | `/bmad/quick-flow` | Rapid feature dev |
| Analyst (Maya) | `/bmad/analyst` | Requirements analysis |
| Scrum Master (Alex) | `/bmad/sm` | Sprint facilitation |
| Test Architect (Quinn) | `/bmad/test-architect` | Testing strategy |

### Workflow Tracks

#### Quick Flow (< 5 min)
For bug fixes, small features:
```
/bmad/quick-flow
> Fix the login redirect bug
```

#### Standard Flow (< 15 min)
For medium features:
```
1. /bmad/pm         → Create story
2. /bmad/architect  → Design solution
3. /bmad/dev        → Implement with TDD
```

#### Enterprise Flow (< 30 min)
For large features:
```
1. /bmad/analyst        → Requirements elicitation
2. /bmad/pm             → PRD & stories
3. /bmad/architect      → Architecture design
4. /bmad/dev            → Implementation
5. /bmad/test-architect → Testing strategy
```

### Using with AI

**Claude Code**:
```
/bmad/dev
> Implement the story in web/docs/bmad/stories/story-001.md
```

**Cursor**:
Reference agents with `@bmad/dev`, `@bmad/architect`, etc.

### Project Context

All agents reference `web/docs/bmad/project-context.md`. Keep this file updated with:
- Tech stack decisions
- Architecture patterns
- Coding standards
- Known constraints

### Templates

Find templates in `web/docs/bmad/templates/`:
- `story-template.md` - Development story format
- `prd-template.md` - Product requirements document
- `architecture-template.md` - Architecture document

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | TypeScript check |
| `pnpm test` | Run tests |
| `pnpm validate` | Lint + type-check |
| `pnpm ci:all` | Run full CI locally |

## Documentation

- `CLAUDE.md` - AI assistant instructions & project rules
- `web/docs/bmad/project-context.md` - Project-specific context for AI agents
- `web/docs/bmad/templates/` - Document templates

## License

MIT
