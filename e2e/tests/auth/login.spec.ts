import { test, expect } from '@playwright/test'

// Clear storageState so all tests in this file run as unauthenticated
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Login', () => {
  test('unauthenticated user is redirected to login when accessing a portal page', async ({
    page,
  }) => {
    await page.goto('/portal/classes')
    await expect(page).toHaveURL(/\/portal\/login/)
  })

  test('already authenticated user is redirected away from login page', async ({
    page,
    browser,
  }) => {
    // Sign in first
    const context = await browser.newContext()
    const authedPage = await context.newPage()
    await authedPage.goto('/portal/login')
    await authedPage.fill('[data-testid="test-email"]', 'admin@test.hshb.local')
    await authedPage.fill(
      '[data-testid="test-password"]',
      process.env.E2E_TEST_SECRET ?? '',
    )
    await authedPage.click('[data-testid="test-login-button"]')
    await authedPage.waitForURL('/portal/dashboard')

    // Now navigating to login should redirect to dashboard
    await authedPage.goto('/portal/login')
    await expect(authedPage).toHaveURL('/portal/dashboard')
    await context.close()
  })

  test('successful login with valid test credentials redirects to dashboard', async ({
    page,
  }) => {
    await page.goto('/portal/login')
    await page.fill('[data-testid="test-email"]', 'admin@test.hshb.local')
    await page.fill(
      '[data-testid="test-password"]',
      process.env.E2E_TEST_SECRET ?? '',
    )
    await page.click('[data-testid="test-login-button"]')
    await expect(page).toHaveURL('/portal/dashboard')
  })

  test('invalid password is rejected and stays on login page', async ({
    page,
  }) => {
    await page.goto('/portal/login')
    await page.fill('[data-testid="test-email"]', 'admin@test.hshb.local')
    await page.fill('[data-testid="test-password"]', 'wrong-password')
    await page.click('[data-testid="test-login-button"]')
    // NextAuth redirects back to login with error query param on auth failure
    await expect(page).toHaveURL(/\/portal\/login/)
  })

  test('unknown email is rejected and stays on login page', async ({
    page,
  }) => {
    await page.goto('/portal/login')
    await page.fill('[data-testid="test-email"]', 'notexist@test.hshb.local')
    await page.fill(
      '[data-testid="test-password"]',
      process.env.E2E_TEST_SECRET ?? '',
    )
    await page.click('[data-testid="test-login-button"]')
    await expect(page).toHaveURL(/\/portal\/login/)
  })
})
