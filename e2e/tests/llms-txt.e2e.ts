import { expect, test } from '@playwright/test'

test.describe('llms.txt', () => {
  test('serves a plain-text school summary for AI assistants', async ({
    request,
  }) => {
    const response = await request.get('/llms.txt')

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/plain')

    const text = await response.text()
    expect(text.startsWith('# Hellenic School of High Barnet (HSHB)')).toBe(
      true,
    )
    for (const heading of [
      '## Quick facts',
      '## About the school',
      '## School day, term dates and FAQs',
      '## Fees, curriculum and enrolment',
      '## Activities and culture',
      '## Location and getting there',
      '## Contact',
    ]) {
      expect(text).toContain(heading)
    }
    expect(text).not.toContain('ctfassets.net')
  })
})
