# Accessibility Guide

This guide covers accessibility (a11y) standards, testing, and implementation patterns for this project.

## Table of Contents

1. [Standards](#standards)
2. [ESLint A11y Rules](#eslint-a11y-rules)
3. [Testing](#testing)
4. [Component Patterns](#component-patterns)
5. [Checklists](#checklists)

---

## Standards

This project targets **WCAG 2.1 Level AA** compliance.

### Key Requirements

| Criterion | Requirement |
|-----------|-------------|
| Color Contrast | 4.5:1 for normal text, 3:1 for large text |
| Focus Indicators | Visible focus on all interactive elements |
| Keyboard Navigation | All functionality accessible via keyboard |
| Screen Readers | Proper ARIA labels and semantic HTML |
| Motion | Respect `prefers-reduced-motion` |
| Touch Targets | Minimum 44x44px for mobile |

---

## ESLint A11y Rules

The project uses `eslint-plugin-jsx-a11y` for static analysis. Key rules:

```javascript
// Already included in eslint config via next/core-web-vitals
{
  "jsx-a11y/alt-text": "error",
  "jsx-a11y/anchor-has-content": "error",
  "jsx-a11y/anchor-is-valid": "error",
  "jsx-a11y/aria-props": "error",
  "jsx-a11y/aria-role": "error",
  "jsx-a11y/role-has-required-aria-props": "error",
  "jsx-a11y/tabindex-no-positive": "error",
}
```

---

## Testing

### Automated Testing

#### 1. axe-core in E2E Tests

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage has no violations', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });

  test('login page has no violations', async ({ page }) => {
    await page.goto('/login');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
```

#### 2. Component Testing with jest-axe

```typescript
// components/Button.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from './Button';

expect.extend(toHaveNoViolations);

describe('Button accessibility', () => {
  it('has no violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('disabled button is accessible', async () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Manual Testing

#### Screen Reader Testing

| Platform | Screen Reader | Command |
|----------|--------------|---------|
| macOS | VoiceOver | Cmd + F5 |
| Windows | NVDA | Free download |
| Windows | Narrator | Win + Ctrl + Enter |
| iOS | VoiceOver | Settings > Accessibility |
| Android | TalkBack | Settings > Accessibility |

#### Keyboard Navigation Checklist

- [ ] Tab through all interactive elements
- [ ] Shift+Tab to go backwards
- [ ] Enter/Space activates buttons
- [ ] Arrow keys for radio/select
- [ ] Escape closes modals/dropdowns
- [ ] Focus never gets trapped

#### Browser Extensions

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) (built into Chrome)

---

## Component Patterns

### Buttons

```tsx
// GOOD: Accessible button
<button
  type="button"
  onClick={handleClick}
  disabled={isLoading}
  aria-busy={isLoading}
  aria-label={iconOnly ? "Submit form" : undefined}
>
  {isLoading ? <Spinner aria-hidden="true" /> : null}
  <span>{isLoading ? 'Submitting...' : 'Submit'}</span>
</button>

// BAD: Inaccessible
<div onClick={handleClick}>Submit</div>
```

### Forms

```tsx
// GOOD: Accessible form
<form onSubmit={handleSubmit}>
  <div>
    <label htmlFor="email">Email address</label>
    <input
      id="email"
      type="email"
      aria-describedby="email-error"
      aria-invalid={errors.email ? true : undefined}
      required
    />
    {errors.email && (
      <p id="email-error" role="alert">
        {errors.email}
      </p>
    )}
  </div>
</form>

// BAD: Missing label association
<input placeholder="Email" />
```

### Images

```tsx
// GOOD: Meaningful image
<img src="/hero.jpg" alt="Team collaborating around a whiteboard" />

// GOOD: Decorative image
<img src="/decorative-bg.png" alt="" role="presentation" />

// BAD: Missing or unhelpful alt
<img src="/hero.jpg" />
<img src="/hero.jpg" alt="image" />
```

### Modals

```tsx
// GOOD: Accessible modal
<dialog
  ref={dialogRef}
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  onKeyDown={(e) => e.key === 'Escape' && onClose()}
>
  <h2 id="modal-title">Confirm Action</h2>
  <p id="modal-description">Are you sure you want to proceed?</p>
  <button onClick={onClose}>Cancel</button>
  <button onClick={onConfirm}>Confirm</button>
</dialog>
```

### Skip Links

```tsx
// Add to layout.tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black"
>
  Skip to main content
</a>

<main id="main-content" tabIndex={-1}>
  {children}
</main>
```

### Live Regions

```tsx
// For dynamic content announcements
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {statusMessage}
</div>

// For urgent announcements
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

---

## Checklists

### New Component Checklist

- [ ] Semantic HTML elements used
- [ ] Keyboard accessible (if interactive)
- [ ] Focus visible and styled
- [ ] Color contrast meets requirements
- [ ] ARIA attributes where needed
- [ ] Works with screen readers
- [ ] Touch targets >= 44px (mobile)
- [ ] Tests include a11y checks

### Pre-Launch Checklist

- [ ] All pages pass Lighthouse accessibility audit >= 90
- [ ] All pages pass axe automated tests
- [ ] Manual keyboard navigation tested
- [ ] Screen reader testing completed
- [ ] Color contrast verified
- [ ] Focus management correct
- [ ] Skip links implemented
- [ ] Error messages accessible
- [ ] Forms properly labeled
- [ ] Images have appropriate alt text
- [ ] Motion respects user preferences

### Testing Commands

```bash
# Run ESLint with a11y rules
pnpm lint

# Run Playwright a11y tests
pnpm test:e2e --grep "accessibility"

# Run Lighthouse audit
npx lighthouse http://localhost:3000 --view

# Run axe CLI
npx @axe-core/cli http://localhost:3000
```

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Inclusive Components](https://inclusive-components.design/)
- [axe-core Rules](https://dequeuniversity.com/rules/axe/)
