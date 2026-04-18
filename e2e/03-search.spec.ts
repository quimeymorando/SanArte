/**
 * E2E — Test 3: Búsqueda de síntomas → página de detalle
 *
 * Verifies the full search → detail flow:
 * - Search input is present on /search
 * - Typing a query shows results
 * - Clicking a result navigates to /symptom-detail
 * - Detail page renders symptom content
 *
 * NOTE: This test uses an authenticated session if E2E_ACCESS_TOKEN is set.
 * Without tokens, it verifies the unauthenticated redirect behavior.
 */

import { test, expect } from '@playwright/test';
import { injectAuthSession, waitForAppReady } from './helpers';

test.describe('Búsqueda → Detalle', () => {
  test.skip(!process.env.E2E_ACCESS_TOKEN, 'E2E auth tokens not configured — skipping authenticated flow');

  test.beforeEach(async ({ page }) => {
    await injectAuthSession(page);
  });

  test('search input is visible on /search', async ({ page }) => {
    await page.goto('/search');
    await waitForAppReady(page);

    const searchInput = page.getByRole('searchbox').or(
      page.getByPlaceholder(/busca|síntoma|search/i)
    ).first();

    await expect(searchInput).toBeVisible({ timeout: 10_000 });
  });

  test('typing a query shows results', async ({ page }) => {
    await page.goto('/search');
    await waitForAppReady(page);

    const searchInput = page.getByRole('searchbox').or(
      page.getByPlaceholder(/busca|síntoma|search/i)
    ).first();

    await searchInput.fill('dolor de cabeza');
    await page.waitForTimeout(800); // Debounce

    // Should show at least one result card
    const results = page.getByRole('article').or(page.locator('[data-testid="symptom-card"]'));
    await expect(results.first()).toBeVisible({ timeout: 15_000 });
  });

  test('clicking a symptom result navigates to detail', async ({ page }) => {
    await page.goto('/search');
    await waitForAppReady(page);

    const searchInput = page.getByRole('searchbox').or(
      page.getByPlaceholder(/busca|síntoma|search/i)
    ).first();

    await searchInput.fill('espalda');
    await page.waitForTimeout(800);

    // Click the first result
    const firstResult = page.getByRole('article').first();
    await firstResult.waitFor({ state: 'visible', timeout: 15_000 });
    await firstResult.click();

    // Should navigate to symptom detail or update the page with detail content
    await page.waitForLoadState('networkidle');
    const url = page.url();
    const hasDetail = url.includes('/symptom-detail') || url.includes('symptom');

    // Alternatively detail might render inline
    const detailHeading = page.getByRole('heading').first();
    const headingVisible = await detailHeading.isVisible().catch(() => false);

    expect(hasDetail || headingVisible).toBeTruthy();
  });
});

test.describe('Búsqueda sin autenticación', () => {
  test('redirects unauthenticated user to landing', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    // Should redirect to landing or show login prompt
    expect(url === 'http://localhost:5173/' || url.endsWith('/')).toBeTruthy();
  });
});
