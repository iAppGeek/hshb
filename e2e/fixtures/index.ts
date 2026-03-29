// Re-export test and expect from @playwright/test.
// isMobile is a built-in Playwright fixture — it is set automatically to true
// when a project uses devices['iPhone 13'] (or any device with isMobile: true).
export { test, expect } from '@playwright/test'
