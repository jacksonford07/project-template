# Claude Rules

These rules guide Claude Code's behavior when working on this project.

## Rules Index

| File | Description |
|------|-------------|
| `development-workflow.md` | Read-first, incremental development, git protocol |
| `code-quality.md` | TypeScript standards, import order, naming conventions |
| `database-patterns.md` | Prisma migrations, soft deletes, query patterns |
| `api-architecture.md` | Route structure, smart sync pattern, logging |
| `bmad-method.md` | BMAD agent roles and workflows |
| `lessons-learned.md` | What failed, what works, critical rules |

## How Rules Work

Rules in `.claude/rules/` are automatically applied when working in this project. They provide context-specific guidance for:

- Code patterns and conventions
- Architecture decisions
- Common pitfalls to avoid
- Development workflows

## BMAD Commands

The BMAD method commands are in `.claude/commands/bmad/`:

| Command | Use For |
|---------|---------|
| `/bmad/quick-flow` | Small features, bug fixes |
| `/bmad/dev` | Story implementation |
| `/bmad/architect` | System design |
| `/bmad/pm` | Product requirements |

## Key Principles

1. **Read before modifying** - Always understand context first
2. **One change at a time** - Test incrementally
3. **DRY** - Check for existing solutions before creating new
4. **Complete features** - No placeholder UI
5. **User feedback** - Toast notifications for actions
6. **Curated filters** - 5-8 categories, not dynamic enumeration

## Updating Rules

When you learn something new that should be remembered:

1. Add to appropriate rule file
2. Or add to `lessons-learned.md`
3. Commit with: `docs(rules): add lesson about X`
