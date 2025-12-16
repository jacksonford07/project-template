# Development Workflow Rules

## Before ANY Code Modification

### 1. Read First, Code Second
- **Always read the entire file** before making changes
- Never make blind search/replace modifications
- Understand the context and dependencies

### 2. DRY Principle
Before creating new components or functions:
1. Search the codebase for existing solutions
2. Check `components/ui/` for reusable components
3. Only create new if nothing suitable exists

### 3. Analyze Dependencies
Before deleting files:
```bash
# Always grep for usages first
grep -r "filename" --include="*.ts" --include="*.tsx"
```

## Implementation Protocol

### One Change at a Time
- Make small, incremental changes
- Test after EACH change
- Don't batch multiple changes together

### Testing Requirements
- Write/update tests for every change
- Run tests before committing
- Never proceed with failing tests

## Git Protocol

### Never Auto-Push
- Do NOT push to remote without explicit user approval
- Always ask before pushing

### Commit Messages
Use conventional commits:
```
feat(scope): add new feature
fix(scope): fix bug
refactor(scope): refactor code
docs(scope): update documentation
test(scope): add tests
chore(scope): maintenance
```

### Before Major Changes
1. Document objective
2. Analyze risks
3. Create detailed plan
4. Get approval
5. Then start coding

## Critical Rules

1. **Read before modifying** - Always
2. **One change at a time** - Test each
3. **Analyze dependencies** - Before deleting
4. **Keep old code** - Until migration proven
5. **Document decisions** - In project files
6. **Get approval** - For major changes
7. **Have rollback plan** - Always
