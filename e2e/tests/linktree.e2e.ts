import { expect, test, type Page } from '@playwright/test'

const VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'Desktop', width: 1280, height: 720 },
] as const

const LINK_NAMES = [
  /visit website/i,
  /contact us/i,
  /register student/i,
  /classdojo family registration/i,
] as const

const assertNoScroll = async (page: Page): Promise<void> => {
  const { scrollHeight, innerHeight } = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
  }))
  expect(scrollHeight).toBeLessThanOrEqual(innerHeight)
}

test.describe('Linktree page', () => {
  for (const viewport of VIEWPORTS) {
    test(`fits on one screen at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      })
      await page.goto('/linktree')

      for (const name of LINK_NAMES) {
        await expect(page.getByRole('link', { name })).toBeVisible()
      }
      await expect(page.getByTitle(/parent sign in/i)).toBeVisible()
      await expect(page.getByTitle(/instagram/i)).toBeVisible()
      await expect(page.getByTitle(/facebook/i)).toBeVisible()
      await expect(page.getByTitle(/follow us on x/i)).toBeVisible()

      await assertNoScroll(page)
    })
  }

  test('CCs the staff email and shows the note for a valid ?t param', async ({
    page,
  }) => {
    await page.goto('/linktree?t=jsmith')

    await expect(
      page.getByText(/shared by jsmith@hshb\.org\.uk/i),
    ).toBeVisible()

    const href = await page
      .getByRole('link', { name: /contact us/i })
      .getAttribute('href')
    expect(href).toContain('cc=jsmith%40hshb.org.uk')
  })

  test('shows no note and no cc without a ?t param', async ({ page }) => {
    await page.goto('/linktree')

    await expect(page.getByText(/shared by/i)).toHaveCount(0)

    const href = await page
      .getByRole('link', { name: /contact us/i })
      .getAttribute('href')
    expect(href).not.toContain('cc=')
  })

  test('shows no note and no cc for an invalid ?t param', async ({ page }) => {
    await page.goto('/linktree?t=jsmith%40evil.com')

    await expect(page.getByText(/shared by/i)).toHaveCount(0)

    const href = await page
      .getByRole('link', { name: /contact us/i })
      .getAttribute('href')
    expect(href).not.toContain('cc=')
  })
})
