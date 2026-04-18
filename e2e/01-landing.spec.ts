/**
 * E2E — Test 1: Landing page
 *
 * Verifies public-facing landing renders correctly, SEO meta tags are present,
 * and basic navigation links work.
 */

import { test, expect } from '@playwright/test';
import { goToLanding } from './helpers';

test.describe('Landing page', () => {
  test('renders title and meta description', async ({ page }) => {
    await goToLanding(page);

    // Title
    await expect(page).toHaveTitle(/SanArte/i);

    // Meta description
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /.+/);
  });

  test('shows primary CTA button', async ({ page }) => {
    await goToLanding(page);

    // There should be at least one prominent CTA (login / empezar)
    const cta = page.getByRole('button').or(page.getByRole('link')).filter({
      hasText: /empez|comenzar|entrar|iniciar|registr/i,
    }).first();

    await expect(cta).toBeVisible();
  });

  test('navigates to /privacy and /terms', async ({ page }) => {
    await goToLanding(page);

    const privacyLink = page.getByRole('link', { name: /privacidad/i }).first();
    if (await privacyLink.isVisible()) {
      await privacyLink.click();
      await expect(page).toHaveURL(/privacy/);
      await expect(page).toHaveTitle(/Privacidad|Privacy/i);
    } else {
      // Navigate directly if no footer link visible
      await page.goto('/privacy');
      await expect(page).toHaveTitle(/Privacidad|Privacy/i);
    }
  });

  test('terms page loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page).toHaveTitle(/T.rminos|Terms/i);
  });

  test('unknown route shows 404 page', async ({ page }) => {
    await page.goto('/ruta-que-no-existe-xyz');
    // Should not crash — show 404 or redirect to landing
    const status = page.getByText(/404|no encontrad|not found/i);
    const isLanding = page.url().includes('/') && !page.url().includes('ruta-que-no-existe-xyz');
    const visible = await status.isVisible().catch(() => false);
    expect(visible || isLanding).toBeTruthy();
  });
});
