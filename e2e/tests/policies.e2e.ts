import { expect, test } from '@playwright/test'

const POLICIES = [
  { slug: 'school-policies', title: /^School Policies/ },
  { slug: 'privacy-policy', title: /^Privacy Notice/ },
  { slug: 'staff-privacy-policy', title: /^Staff Privacy Notice/ },
] as const

const isDocumentRequest = (url: string): boolean =>
  /^\/policies\/.+|\.pdf$/.test(new URL(url).pathname)

test.describe('Policies', () => {
  test('the index links each policy to its clean PDF URL in a new tab', async ({
    page,
  }) => {
    await page.goto('/policies')

    await expect(
      page.getByRole('heading', { level: 1, name: 'School Policies' }),
    ).toBeVisible()

    const main = page.getByRole('main')
    for (const policy of POLICIES) {
      const link = main.getByRole('link', { name: policy.title })
      await expect(link).toHaveAttribute('href', `/policies/${policy.slug}`)
      await expect(link).toHaveAttribute('target', '_blank')
    }
    await expect(main.locator('a[href*="ctfassets.net"]')).toHaveCount(0)
  })

  for (const path of ['/', '/policies', '/linktree']) {
    test(`${path} does not download any policy document on load`, async ({
      page,
    }) => {
      const documentRequests: string[] = []
      page.on('request', (req) => {
        if (isDocumentRequest(req.url())) documentRequests.push(req.url())
      })

      await page.goto(path)
      await page.mouse.wheel(0, 100000)
      await page.waitForLoadState('networkidle')

      expect(documentRequests).toEqual([])
    })
  }

  for (const policy of POLICIES) {
    test(`/policies/${policy.slug} serves the original PDF inline`, async ({
      request,
    }) => {
      const res = await request.get(`/policies/${policy.slug}`)

      expect(res.status()).toBe(200)
      expect(res.headers()['content-type']).toBe('application/pdf')
      expect(res.headers()['content-disposition']).toMatch(
        /^inline; filename=".+\.pdf"$/,
      )
      expect((await res.body()).subarray(0, 5).toString()).toBe('%PDF-')
    })
  }

  test('an unknown policy slug is a 404', async ({ request }) => {
    const res = await request.get('/policies/not-a-policy')
    expect(res.status()).toBe(404)
  })

  for (const source of ['/privacy', '/privacy-notice', '/privacy-policy']) {
    test(`${source} permanently redirects to the policies page`, async ({
      request,
    }) => {
      const res = await request.get(source, { maxRedirects: 0 })

      expect(res.status()).toBe(308)
      expect(res.headers()['location']).toBe('/policies')
    })
  }

  test('the homepage links to the policies page in a new tab from the footer, enrolment and contact form', async ({
    page,
  }) => {
    await page.goto('/')

    const links = [
      page
        .locator('footer')
        .getByRole('navigation', { name: 'Policies' })
        .getByRole('link', { name: 'Policies & Privacy' }),
      page.locator('#enrolment').getByRole('link', {
        name: 'School Policies and Privacy Notice',
      }),
      page
        .locator('form[name="contact-us-form"]')
        .getByRole('link', { name: 'Privacy Notice' }),
    ]
    for (const link of links) {
      await expect(link).toHaveAttribute('href', '/policies')
      await expect(link).toHaveAttribute('target', '_blank')
    }
  })

  test('the sitemap includes the policies page', async ({ request }) => {
    const body = await (await request.get('/sitemap.xml')).text()

    expect(body).toContain('https://www.hshb.org.uk/policies</loc>')
  })
})
