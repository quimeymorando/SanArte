import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for SanArte.
 *
 * Runs against the local dev server (http://localhost:5173).
 * In CI, the server is started automatically by webServer.
 *
 * 5 critical flows tested:
 *  1. Landing page load + public navigation
 *  2. Auth flow (sign-in redirect)
 *  3. Symptom search → detail flow
 *  4. Paywall / upgrade page CTAs
 *  5. Profile page rendering
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',

  // Fail fast on first test file failure in CI
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    // Capture traces on retry for debugging
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Use a consistent viewport
    viewport: { width: 1280, height: 720 },
    // Default locale matching app default
    locale: 'es-AR',
    timezoneId: 'America/Argentina/Buenos_Aires',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Auto-start dev server when running locally
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
