import { expect, test } from '@playwright/test'

const POLICIES = [
  { slug: 'school-policies', title: /^School Policies/ },
  { slug: 'privacy-policy', title: /^Privacy Notice/ },
  { slug: 'staff-privacy-policy', title: /^Staff Privacy Notice/ },
] as const

test.describe('Policies', () => {
  test('the index lists every policy, linking to its PDF URL', async ({
    page,
  }) => {
    await page.goto('/policies')

    await expect(
      page.getByRole('heading', { level: 1, name: 'School Policies' }),
    ).toBeVisible()

    const main = page.getByRole('main')
    for (const policy of POLICIES) {
      await expect(
        main.getByRole('link', { name: policy.title }),
      ).toHaveAttribute('href', `/policies/${policy.slug}`)
    }
  })

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
    test(`${source} permanently redirects to the privacy notice`, async ({
      request,
    }) => {
      const res = await request.get(source, { maxRedirects: 0 })

      expect(res.status()).toBe(308)
      expect(res.headers()['location']).toBe('/policies/privacy-policy')
    })
  }

  test('/policies/school-policy redirects to the school policies', async ({
    request,
  }) => {
    const res = await request.get('/policies/school-policy', {
      maxRedirects: 0,
    })

    expect(res.status()).toBe(308)
    expect(res.headers()['location']).toBe('/policies/school-policies')
  })

  test('the homepage links to the policies from the footer, enrolment and contact form', async ({
    page,
  }) => {
    await page.goto('/')

    const footerNav = page
      .locator('footer')
      .getByRole('navigation', { name: 'Policies' })
    await expect(
      footerNav.getByRole('link', { name: 'School Policies' }),
    ).toHaveAttribute('href', '/policies')
    await expect(
      footerNav.getByRole('link', { name: 'Privacy Notice' }),
    ).toHaveAttribute('href', '/policies/privacy-policy')

    await expect(
      page.locator('#enrolment').getByRole('link', { name: 'Privacy Notice' }),
    ).toHaveAttribute('href', '/policies/privacy-policy')
    await expect(
      page
        .locator('form[name="contact-us-form"]')
        .getByRole('link', { name: 'Privacy Notice' }),
    ).toHaveAttribute('href', '/policies/privacy-policy')
  })

  test('the sitemap includes the policies', async ({ request }) => {
    const body = await (await request.get('/sitemap.xml')).text()

    expect(body).toContain('https://www.hshb.org.uk/policies</loc>')
    for (const policy of POLICIES) {
      expect(body).toContain(
        `https://www.hshb.org.uk/policies/${policy.slug}</loc>`,
      )
    }
  })
})
