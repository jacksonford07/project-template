# Lessons Learned - What NOT to Do

## Things That Failed

### 1. Deleting Files Without Analysis
**What happened**: Deleted service files without checking dependencies
**Impact**: Broke system, had to restore from git
**Lesson**: Always grep for usages before deleting

### 2. Making Many Changes at Once
**What happened**: Changed schema, modified 20+ files simultaneously
**Impact**: Hard to debug, TypeScript errors everywhere
**Lesson**: One change at a time, test after each

### 3. Not Reading Files Before Modifying
**What happened**: Made blind search/replace changes
**Impact**: Incorrect modifications, merge conflicts
**Lesson**: ALWAYS read full file content first

### 4. Hardcoding Data Structures
**What happened**: Charts hardcoded specific types
**Impact**: Broke when new types were added
**Lesson**: Make components dynamic, iterate over data

### 5. Placeholder UI Elements
**What happened**: Added buttons without onClick handlers
**Impact**: Users clicked non-functional UI, bad UX
**Lesson**: If you add UI, make it functional

### 6. Dynamic Filter Overload
**What happened**: Generated filters from all tags dynamically
**Impact**: 50+ filter tabs, overwhelming and unusable
**Lesson**: Curate filters to 5-8 meaningful categories

## What Works Well

### 1. Comprehensive Planning Before Coding
- Document objective
- Analyze risks
- Create detailed plan
- Get approval
- **Then** start coding

### 2. Incremental Implementation
- Phase 1: Add new features
- Phase 2: Update consumers
- Phase 3: Deprecate old (gradually)
- Test after EACH phase

### 3. Centralize Constants
**What happened**: Hardcoded colors in multiple files
**Solution**: Created central `styles/colors.ts`
**Impact**: Change once, updates everywhere

### 4. Check Existing Code First (DRY)
**What happened**: Created custom components
**Better approach**: Found existing components in `ui/`
**Saved**: 40+ lines by reusing

### 5. Toast Notifications for User Feedback
**What happened**: Click-to-copy with no feedback
**Solution**: Added toast notifications
**Impact**: Users know their action succeeded

## Critical Rules Summary

1. **Read before modifying** - Always
2. **One change at a time** - Test each
3. **Analyze dependencies** - Before deleting
4. **Keep old code** - Until migration proven
5. **Document decisions** - In project files
6. **Get approval** - For major changes
7. **Have rollback plan** - Always
8. **Complete every feature** - No placeholder UI
9. **Give user feedback** - Toast notifications
10. **Curate, don't enumerate** - 5-8 filter categories max
