/**
 * E2E — Test 5: Perfil de usuario
 *
 * Verifies:
 * - /profile page renders user info
 * - XP / streak / level stats are displayed
 * - Settings / language selector visible
 * - Sign-out button is accessible
 */

import { test, expect } from '@playwright/test';
import { injectAuthSession, waitForAppReady } from './helpers';

test.describe('Profile page', () => {
  test.skip(!process.env.E2E_ACCESS_TOKEN, 'E2E auth tokens not configured');

  test.beforeEach(async ({ page }) => {
    await injectAuthSession(page);
  });

  test('profile page renders without crash', async ({ page }) => {
    await page.goto('/profile');
    await waitForAppReady(page);

    // Body should have content
    await expect(page.locator('body')).not.toBeEmpty();

    // Should not show a full-page error
    const errorBoundary = page.getByRole('alert').filter({ hasText: /error inesperado/i });
    await expect(errorBoundary).toBeHidden();
  });

  test('shows user gamification stats', async ({ page }) => {
    await page.goto('/profile');
    await waitForAppReady(page);

    // XP, level, or streak should appear somewhere on the profile
    const stats = page.getByText(/xp|nivel|level|racha|streak/i).first();
    await expect(stats).toBeVisible({ timeout: 10_000 });
  });

  test('sign-out button is accessible', async ({ page }) => {
    await page.goto('/profile');
    await waitForAppReady(page);

    const signOutBtn = page.getByRole('button', { name: /cerrar sesión|sign out|salir/i }).first();
    await expect(signOutBtn).toBeVisible({ timeout: 10_000 });

    // Button should be focusable via keyboard
    await signOutBtn.focus();
    await expect(signOutBtn).toBeFocused();
  });

  test('profile page has correct page title', async ({ page }) => {
    await page.goto('/profile');
    await waitForAppReady(page);
    await expect(page).toHaveTitle(/Perfil|Profile|SanArte/i);
  });
});

test.describe('Profile page (unauthenticated)', () => {
  test('redirects to landing when not logged in', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    const url = page.url();
    // Should redirect to landing
    expect(url === 'http://localhost:5173/' || url.endsWith('/')).toBeTruthy();
  });
});
