import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration.
 *
 * Artefacts (screenshots, video, traces) are captured only for failures so that
 * a green run stays fast and the HTML report stays small, while a red run gives
 * everything needed to diagnose it without re-running locally.
 */
export default defineConfig({
  testDir: './tests',

  /* Each spec file runs in its own worker; tests inside a file also run in parallel. */
  fullyParallel: true,

  /* Guard against `test.only` being committed by accident. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only — locally a flake should be visible, not hidden. */
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  /* Fail a test that hangs rather than letting the whole run stall. */
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',

    /* Debug artefacts. */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
