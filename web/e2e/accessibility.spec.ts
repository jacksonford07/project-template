import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

/**
 * Accessibility E2E Tests
 *
 * Automated accessibility testing using axe-core.
 * Tests check for WCAG 2.1 Level AA compliance.
 *
 * Run with: pnpm test:e2e --grep "accessibility"
 */

test.describe('Accessibility', () => {
  test('homepage has no critical violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // Log any violations for debugging (violations are logged by Playwright reporter)

    // Filter for critical and serious issues
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toEqual([]);
  });

  test('login page has no critical violations', async ({ page }) => {
    await page.goto('/login');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalViolations).toEqual([]);
  });

  test('all pages should have proper heading hierarchy', async ({ page }) => {
    const pagesToTest = ['/', '/login'];

    for (const pagePath of pagesToTest) {
      await page.goto(pagePath);

      // Check for proper heading hierarchy using axe rules
      const results = await new AxeBuilder({ page })
        .include('body')
        .withRules(['heading-order', 'page-has-heading-one'])
        .analyze();

      const criticalHeadingIssues = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(
        criticalHeadingIssues,
        `Page ${pagePath} has heading hierarchy issues`
      ).toEqual([]);
    }
  });

  test('interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Test keyboard navigation
    await page.keyboard.press('Tab');

    // Check that something is focused
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(focusedElement).toBeTruthy();

    // Run axe keyboard accessibility checks
    const results = await new AxeBuilder({ page })
      .withRules([
        'focus-order-semantics',
        'focusable-content',
        'keyboard-focusable-no-focus-visible',
      ])
      .analyze();

    const keyboardIssues = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(keyboardIssues).toEqual([]);
  });

  test('color contrast meets WCAG AA standards', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast', 'color-contrast-enhanced'])
      .analyze();

    // Filter for critical contrast issues only
    const contrastViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(contrastViolations).toEqual([]);
  });

  test('images have appropriate alt text', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withRules(['image-alt', 'image-redundant-alt', 'input-image-alt'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('forms are accessible', async ({ page }) => {
    await page.goto('/login');

    const results = await new AxeBuilder({ page })
      .withRules([
        'label',
        'label-title-only',
        'form-field-multiple-labels',
        'autocomplete-valid',
      ])
      .analyze();

    const formViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(formViolations).toEqual([]);
  });

  test('ARIA attributes are valid', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withRules([
        'aria-allowed-attr',
        'aria-hidden-body',
        'aria-hidden-focus',
        'aria-required-attr',
        'aria-required-children',
        'aria-required-parent',
        'aria-roles',
        'aria-valid-attr',
        'aria-valid-attr-value',
      ])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

test.describe('Dark Mode Accessibility', () => {
  test('dark mode maintains color contrast', async ({ page }) => {
    await page.goto('/');

    // Enable dark mode via class (simulating next-themes)
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    // Wait for theme transition
    await page.waitForTimeout(100);

    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    const contrastViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(contrastViolations).toEqual([]);
  });
});
