import { expect, test } from '@playwright/test'

const NAV_ANCHORS = [
  '#about-us',
  '#our-community',
  '#events',
  '#enrolment',
  '#contact',
] as const

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders the expected document title', async ({ page }) => {
    await expect(page).toHaveTitle(/Hellenic School of High Barnet/)
  })

  test('renders the hero heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /The Hellenic School @ Cockfosters/i,
      }),
    ).toBeVisible()
  })

  test('every navbar anchor resolves to an element on the page', async ({
    page,
  }) => {
    for (const anchor of NAV_ANCHORS) {
      await expect(page.locator(anchor)).toHaveCount(1)
    }
  })

  test('renders the footer', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible()
  })
})
