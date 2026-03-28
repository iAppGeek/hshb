import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'e2e/.report', open: 'never' }]],
  outputDir: 'e2e/.results',
  globalSetup: './e2e/global-setup.ts',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    // Single auth setup project — creates storageState for all 4 roles.
    // testDir overrides the root testDir so Playwright finds auth.setup.ts in e2e/
    {
      name: 'setup',
      testDir: './e2e',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Desktop tests per role
    {
      name: 'desktop:admin',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
    },
    {
      name: 'desktop:teacher',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/teacher.json',
      },
    },
    {
      name: 'desktop:headteacher',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/headteacher.json',
      },
    },
    {
      name: 'desktop:secretary',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/secretary.json',
      },
    },

    // Mobile tests per role
    {
      name: 'mobile:admin',
      dependencies: ['setup'],
      use: {
        ...devices['iPhone 13'],
        storageState: 'e2e/.auth/admin.json',
      },
    },
    {
      name: 'mobile:teacher',
      dependencies: ['setup'],
      use: {
        ...devices['iPhone 13'],
        storageState: 'e2e/.auth/teacher.json',
      },
    },
    {
      name: 'mobile:headteacher',
      dependencies: ['setup'],
      use: {
        ...devices['iPhone 13'],
        storageState: 'e2e/.auth/headteacher.json',
      },
    },
    {
      name: 'mobile:secretary',
      dependencies: ['setup'],
      use: {
        ...devices['iPhone 13'],
        storageState: 'e2e/.auth/secretary.json',
      },
    },
  ],

  webServer: {
    command: 'dotenv -e .env.e2e -- npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
