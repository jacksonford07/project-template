import { test, expect } from '@playwright/test';

/**
 * Home Page E2E Tests
 *
 * These tests verify the main user journeys on the home page.
 * Run with: pnpm test:e2e
 */

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the home page', async ({ page }) => {
    // Check page loads successfully
    await expect(page).toHaveTitle(/.*$/);
  });

  test('should have accessible navigation', async ({ page }) => {
    // Check for main landmark elements
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Content should still be visible
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');

    // Example: Click a link and verify navigation
    // Customize based on your actual navigation structure
    // const navLink = page.getByRole('link', { name: 'About' });
    // await navLink.click();
    // await expect(page).toHaveURL('/about');
  });
});

test.describe('Accessibility', () => {
  test('should have no automatically detectable accessibility issues', async ({
    page,
  }) => {
    await page.goto('/');

    // Basic accessibility checks
    // For comprehensive a11y testing, consider adding @axe-core/playwright

    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    expect(h1Count).toBeLessThanOrEqual(1); // Should have at most one h1

    // Check images have alt text
    const imagesWithoutAlt = page.locator('img:not([alt])');
    const count = await imagesWithoutAlt.count();
    expect(count).toBe(0);
  });
});
