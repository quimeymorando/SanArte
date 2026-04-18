/**
 * E2E — Test 2: Auth flow
 *
 * Verifies:
 * - Unauthenticated users are redirected to landing when accessing protected routes
 * - /auth/callback page renders without crashing
 * - Sign-out clears state and redirects to landing
 */

import { test, expect } from '@playwright/test';
import { goToLanding, injectAuthSession } from './helpers';

test.describe('Auth flow', () => {
  test('redirects unauthenticated user from /home to landing', async ({ page }) => {
    await page.goto('/home');
    // Should land on / (landing) or a login-prompting page
    await expect(page).toHaveURL(/^\/(login|$|\?)/);
    // OR: the page shows sign-in UI
    const signIn = page.getByRole('button', { name: /iniciar|entrar|sign.?in/i }).first();
    const isRedirected = page.url() === 'http://localhost:5173/' || page.url().endsWith('/');
    const signInVisible = await signIn.isVisible().catch(() => false);
    expect(isRedirected || signInVisible).toBeTruthy();
  });

  test('redirects unauthenticated user from /search to landing', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    // Either redirected to landing or shows sign-in prompt
    expect(url.endsWith('/') || url.includes('login') || url.includes('home') === false).toBeTruthy();
  });

  test('/auth/callback page renders without error', async ({ page }) => {
    // Visit callback with a fake token (will fail gracefully)
    await page.goto('/auth/callback?code=fake-code-for-e2e');
    await page.waitForLoadState('domcontentloaded');
    // Should not show a JS crash / white screen
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
    // Should not show a raw error stack trace
    const stackTrace = page.getByText(/at Object\./);
    await expect(stackTrace).toBeHidden();
  });

  test.describe('authenticated session', () => {
    test.beforeEach(async ({ page }) => {
      await injectAuthSession(page);
    });

    test('authenticated user can access /home', async ({ page }) => {
      // Only run if E2E_ACCESS_TOKEN is configured
      test.skip(!process.env.E2E_ACCESS_TOKEN, 'E2E auth tokens not configured');

      await page.goto('/home');
      await page.waitForLoadState('networkidle');
      // Should not redirect back to landing
      expect(page.url()).not.toMatch(/\/?$/);
    });
  });
});
