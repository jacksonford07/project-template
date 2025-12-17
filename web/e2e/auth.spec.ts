import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 *
 * Tests for login, logout, and protected routes.
 * Customize based on your authentication implementation.
 */

test.describe('Authentication Flow', () => {
  test('should show login option for unauthenticated users', async ({
    page,
  }) => {
    await page.goto('/');

    // Check for sign-in button/link
    // Customize selector based on your UI
    // const signInButton = page.getByRole('button', { name: /sign in/i });
    // await expect(signInButton).toBeVisible();
  });

  test('should redirect unauthenticated users from protected routes', async ({
    page,
  }) => {
    // Attempt to access a protected route
    await page.goto('/dashboard');

    // Should redirect to login or show unauthorized message
    // Customize based on your auth flow
    // await expect(page).toHaveURL(/.*login.*/);
    // OR
    // await expect(page.getByText(/sign in/i)).toBeVisible();
  });

  test('should handle OAuth login flow', async ({ page }) => {
    await page.goto('/api/auth/signin');

    // Check OAuth providers are displayed
    // Customize based on your configured providers
    // const googleButton = page.getByRole('button', { name: /google/i });
    // await expect(googleButton).toBeVisible();
  });
});

test.describe('Protected Routes', () => {
  // Use authentication state for these tests
  // See: https://playwright.dev/docs/auth

  test.skip('should allow authenticated users to access dashboard', async ({
    page,
  }) => {
    // This test requires authentication setup
    // See e2e/fixtures/auth.ts for authentication helpers

    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });
});

/**
 * Authentication Helper Setup
 *
 * To test authenticated flows, create a global setup:
 *
 * 1. Create e2e/auth.setup.ts:
 *    ```ts
 *    import { test as setup } from '@playwright/test';
 *
 *    setup('authenticate', async ({ page }) => {
 *      await page.goto('/api/auth/signin');
 *      // Perform login...
 *      await page.context().storageState({ path: '.auth/user.json' });
 *    });
 *    ```
 *
 * 2. Add to playwright.config.ts:
 *    ```ts
 *    projects: [
 *      { name: 'setup', testMatch: /.*\.setup\.ts/ },
 *      {
 *        name: 'chromium',
 *        dependencies: ['setup'],
 *        use: { storageState: '.auth/user.json' },
 *      },
 *    ]
 *    ```
 */
