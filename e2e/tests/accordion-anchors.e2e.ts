import { expect, test } from '@playwright/test'

const ITEMS = '#about-us dl > div[id]'

test.describe('About Us accordion deep links', () => {
  test('every item has an id so it can be linked to', async ({ page }) => {
    await page.goto('/')

    const items = page.locator(ITEMS)
    await expect(items.first()).toBeAttached()

    const ids = await items.evaluateAll((els) => els.map((el) => el.id))
    expect(ids.every((id) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id))).toBe(true)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('loading the page with an item hash opens that item', async ({
    page,
  }) => {
    await page.goto('/')
    const ids = await page
      .locator(ITEMS)
      .evaluateAll((els) => els.map((el) => el.id))
    const target = ids[ids.length - 1]

    await page.goto(`/#${target}`)

    const item = page.locator(`#${target}`)
    await expect(item.getByRole('button')).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(item.locator('dd')).toBeVisible()
    await expect(item).toBeInViewport()

    for (const other of ids.filter((id) => id !== target)) {
      await expect(
        page.locator(`#${other}`).getByRole('button'),
      ).toHaveAttribute('aria-expanded', 'false')
    }
  })
})
