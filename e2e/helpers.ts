/**
 * Shared E2E helpers for SanArte tests.
 */

import { Page, expect } from '@playwright/test';

/** Wait for the SPA shell to be ready (spinner gone, nav visible) */
export const waitForAppReady = async (page: Page): Promise<void> => {
  // Spinner disappears
  await expect(page.getByRole('status').filter({ hasText: /cargando/i })).toBeHidden({ timeout: 15_000 });
};

/** Navigate to landing and assert core elements */
export const goToLanding = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(page).toHaveTitle(/SanArte/i);
};

/** Simulate a logged-in session by injecting Supabase auth tokens into localStorage */
export const injectAuthSession = async (page: Page): Promise<void> => {
  const accessToken = process.env.E2E_ACCESS_TOKEN ?? '';
  const refreshToken = process.env.E2E_REFRESH_TOKEN ?? '';
  const userId = process.env.E2E_USER_ID ?? 'test-user-e2e';

  if (!accessToken) return; // Skip auth injection if not configured

  await page.addInitScript(
    ({ at, rt, uid }) => {
      const session = {
        access_token: at,
        refresh_token: rt,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: { id: uid, email: 'e2e@sanarte.app' },
      };
      localStorage.setItem(
        `sb-${location.hostname}-auth-token`,
        JSON.stringify(session)
      );
    },
    { at: accessToken, rt: refreshToken, uid: userId }
  );
};
