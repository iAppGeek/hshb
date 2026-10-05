import { expect, type Locator, type Page, test } from '@playwright/test'

const GROUP = '[id="about-us"] dl'
const ITEMS = `${GROUP} > div[id]`

const byId = (page: Page, id: string): Locator => page.locator(`[id="${id}"]`)

const toggleFor = (page: Page, id: string): Locator =>
  byId(page, id).locator('dt').getByRole('button')

const itemIds = async (page: Page): Promise<string[]> =>
  page
    .locator(ITEMS)
    .evaluateAll((els): string[] => els.map((el): string => el.id))

// Wait for the accordion to hydrate. Changing the hash before then races
// Next's router, which rewrites the URL during hydration.
const waitForAccordion = async (page: Page): Promise<void> => {
  await expect(page.locator(`${GROUP}[data-ready]`)).toBeAttached()
}

test.describe('About Us accordion deep links', (): void => {
  test('every item has a unique, prefixed, URL-safe id', async ({
    page,
  }): Promise<void> => {
    await page.goto('/')

    const ids = await itemIds(page)

    expect(ids.length).toBeGreaterThan(0)
    for (const id of ids) expect(id).toMatch(/^faq-[a-z0-9]+(-[a-z0-9]+)*$/)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('a fresh page load with the hash opens that item', async ({
    browser,
    page,
  }): Promise<void> => {
    await page.goto('/')
    const ids = await itemIds(page)
    const target = ids[ids.length - 1]

    // New context: a cold load with the hash present, as when a parent
    // follows a shared link.
    const context = await browser.newContext()
    const linked = await context.newPage()
    await linked.goto(new URL(`/#${target}`, page.url()).href)

    await expect(toggleFor(linked, target)).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(byId(linked, target).locator('dd')).toBeVisible()
    await expect(byId(linked, target)).toBeInViewport()
    for (const other of ids.filter((id): boolean => id !== target)) {
      await expect(toggleFor(linked, other)).toHaveAttribute(
        'aria-expanded',
        'false',
      )
    }

    await context.close()
  })

  test('changing the hash opens the targeted item and closes the others', async ({
    page,
  }): Promise<void> => {
    await page.goto('/')
    await waitForAccordion(page)
    const [first, second] = await itemIds(page)

    await page.evaluate((id): void => {
      window.location.hash = id
    }, first)
    await expect(toggleFor(page, first)).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await page.evaluate((id): void => {
      window.location.hash = id
    }, second)
    await expect(toggleFor(page, second)).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(toggleFor(page, first)).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  test('clicking a link to the hash already in the URL reopens the item', async ({
    page,
  }): Promise<void> => {
    await page.goto('/')
    const [target] = await itemIds(page)
    await page.goto('about:blank')
    await page.goto(`/#${target}`)
    await waitForAccordion(page)
    await expect(toggleFor(page, target)).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await toggleFor(page, target).click()
    await expect(toggleFor(page, target)).toHaveAttribute(
      'aria-expanded',
      'false',
    )

    await page.evaluate((id): void => {
      const link = document.createElement('a')
      link.href = `#${id}`
      link.textContent = 'Same-hash link'
      document.body.prepend(link)
    }, target)
    await page.getByRole('link', { name: 'Same-hash link' }).click()

    await expect(toggleFor(page, target)).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })
})
