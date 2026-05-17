import { expect, test } from '@playwright/test'

test.describe('Events section', () => {
  test('renders the section heading and at least one event card or placeholder', async ({
    page,
  }) => {
    await page.goto('/')

    const eventsSection = page.locator('#events')
    await expect(eventsSection).toBeVisible()

    await expect(
      page.getByRole('heading', { level: 2, name: /Our Events Calendar/i }),
    ).toBeVisible()

    // Either real event cards (li children of the recent-events list) or
    // the placeholder rendered when Contentful returns nothing.
    const eventItems = eventsSection.locator('ol > li')
    await expect(eventItems.first()).toBeVisible()
  })

  test('lazy-loads the Google Calendar iframe once scrolled into view', async ({
    page,
  }) => {
    await page.goto('/')

    const iframe = page.locator('iframe[title="HSHB Events Calendar"]')

    // CalendarEmbed only mounts the iframe after IntersectionObserver fires,
    // so scroll the section into view first.
    await page.locator('#events').scrollIntoViewIfNeeded()
    await expect(iframe).toBeVisible()
  })
})
