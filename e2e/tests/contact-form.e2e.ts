import { expect, test } from '@playwright/test'

test.describe('Contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#contact')
  })

  test('renders all expected fields', async ({ page }) => {
    await expect(page.locator('#first-name')).toBeVisible()
    await expect(page.locator('#last-name')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#phone-number')).toBeVisible()
    await expect(page.locator('#message')).toBeVisible()
    await expect(
      page.getByRole('button', { name: /send message/i }),
    ).toBeVisible()
  })

  test('shows the success badge after a 200 response', async ({ page }) => {
    // Netlify's form shim isn't served by `next dev`; stub it so the test
    // exercises the success path instead of hitting the dev-server 404.
    await page.route('**/__forms.html', (route) =>
      route.fulfill({ status: 200 }),
    )

    await page.locator('#first-name').fill('Test')
    await page.locator('#last-name').fill('User')
    await page.locator('#email').fill('test@example.com')
    await page.locator('#phone-number').fill('07000000000')
    await page.locator('#message').fill('Hello from Playwright')

    await page.getByRole('button', { name: /send message/i }).click()

    await expect(page.getByText('Submitted!')).toBeVisible()
  })

  test('shows an error badge after a 500 response', async ({ page }) => {
    await page.route('**/__forms.html', (route) =>
      route.fulfill({ status: 500, body: 'boom' }),
    )

    await page.locator('#first-name').fill('Test')
    await page.locator('#email').fill('test@example.com')
    await page.getByRole('button', { name: /send message/i }).click()

    await expect(page.getByText(/500/)).toBeVisible()
  })
})
