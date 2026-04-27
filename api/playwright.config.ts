import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for API Contract Tests
 * Tests run against the backend API (port 3001)
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. */
  reporter: 'html',
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions - API runs on port 3001 */
    baseURL: process.env.API_BASE_URL || 'http://localhost:3001',

    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',

    /* Screenshot only on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers - API tests use request context */
  projects: [
    {
      name: 'api-tests',
      testMatch: /.*\.spec\.ts/,
      use: {
        baseURL: process.env.API_BASE_URL || 'http://localhost:3001',
      },
    },
  ],

  /* API must be running on http://localhost:3001 */
  /* Execute in another terminal: cd app && docker-compose up */
});