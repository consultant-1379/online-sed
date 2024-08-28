import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/ui-test',
  fullyParallel: true,
  reporter: 'html',
  timeout: 30000,
  maxFailures: 3,

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    }
    //,
    //    {
    //      name: 'webkit',
    //      use: { ...devices['Desktop Safari'] },
    //   }
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev:test',
    port: 5002,
    reuseExistingServer: true,
  }
});