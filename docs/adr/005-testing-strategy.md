# ADR-005: Testing Strategy

## Status

Accepted

## Context

We need a testing strategy that:
- Catches bugs before production
- Provides confidence in refactoring
- Runs quickly in CI
- Is maintainable long-term
- Covers different levels of the stack

## Decision

Implement a three-tier testing strategy:

| Level | Tool | Purpose | Coverage Target |
|-------|------|---------|-----------------|
| Unit | Vitest | Functions, hooks, utilities | 50%+ |
| Integration | Vitest | API routes, components | Key flows |
| E2E | Playwright | User journeys | Critical paths |

### Test Structure

```
web/
├── src/
│   └── __tests__/
│       ├── api/           # API route tests
│       ├── components/    # Component tests
│       ├── lib/           # Utility tests
│       └── fixtures/      # Test factories & mocks
├── e2e/                   # Playwright E2E tests
└── vitest.config.ts       # Unit/integration config
```

## Consequences

### Positive

- **Fast feedback**: Unit tests run in seconds
- **Confidence**: E2E tests verify real user flows
- **Maintainability**: Test factories reduce duplication
- **Coverage tracking**: Thresholds prevent regression
- **CI integration**: Automated quality gates

### Negative

- **Initial setup time**: Three testing tools to configure
- **E2E flakiness**: Browser tests can be unstable
- **Maintenance burden**: Tests need updating with features
- **CI time**: E2E tests are slower

### Neutral

- Team needs to learn multiple testing patterns
- Balance between coverage and maintenance

## Implementation

### Unit Test Example

```typescript
// __tests__/lib/format-utils.test.ts
import { formatCurrency } from '@/lib/format-utils';

describe('formatCurrency', () => {
  it('formats positive numbers', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});
```

### API Route Test Example

```typescript
// __tests__/api/users.test.ts
import { GET } from '@/app/api/internal/users/route';

describe('GET /api/internal/users', () => {
  it('returns users list', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
});
```

### E2E Test Example

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can sign in', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});
```

### Coverage Thresholds

```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    lines: 50,
    functions: 50,
    branches: 50,
    statements: 50,
  },
}
```

## Alternatives Considered

### Jest Instead of Vitest

Industry standard test runner. Rejected because:
- Slower than Vitest
- More configuration needed
- Vitest has better ESM support

### Cypress Instead of Playwright

Popular E2E framework. Rejected because:
- Slower test execution
- Larger bundle size
- Playwright has better multi-browser support

### No E2E Tests

Unit and integration only. Rejected because:
- Miss integration issues
- No confidence in user flows
- Catch bugs users actually experience

### 80%+ Coverage Target

Higher coverage threshold. Rejected because:
- Diminishing returns past 50-60%
- Encourages testing implementation details
- Start lower, increase over time

## References

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
