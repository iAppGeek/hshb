import { describe, expect, it } from 'vitest'

import {
  DEFAULT_MAX_MAILTO_LENGTH,
  formatEmailsAsCsv,
  guardianEmailsForMailto,
  mailtoWithBcc,
  normalizeAndDedupeEmails,
  staffEmailsForMailto,
} from './mailto'

describe('normalizeAndDedupeEmails', () => {
  it('trims, skips empty, dedupes case-insensitively', () => {
    expect(
      normalizeAndDedupeEmails([
        ' A@b.com ',
        'a@b.com',
        '',
        null,
        undefined,
        'c@d.com',
      ]),
    ).toEqual(['A@b.com', 'c@d.com'])
  })

  it('returns empty array when nothing valid', () => {
    expect(normalizeAndDedupeEmails([null, '', '   '])).toEqual([])
  })
})

describe('mailtoWithBcc', () => {
  it('returns null for empty list', () => {
    expect(mailtoWithBcc([])).toBeNull()
    expect(mailtoWithBcc(['', '  '])).toBeNull()
  })

  it('builds mailto with bcc and optional subject/body', () => {
    const href = mailtoWithBcc(['one@test.com', 'two@test.com'], {
      subject: 'Hello',
      body: 'Line',
    })
    expect(href).toMatch(/^mailto:\?/)
    expect(href).toContain('bcc=')
    expect(href).toContain('subject=')
    expect(href).toContain('body=')
    const u = new URL(href!.replace(/^mailto:/, 'http://x'))
    expect(u.searchParams.get('bcc')).toContain('one@test.com')
    expect(u.searchParams.get('bcc')).toContain('two@test.com')
    expect(u.searchParams.get('subject')).toBe('Hello')
    expect(u.searchParams.get('body')).toBe('Line')
  })

  it('returns null when href exceeds maxTotalLength', () => {
    const longLocal = 'x'.repeat(500)
    const many = Array.from({ length: 20 }, (_, i) => `${longLocal}${i}@y.com`)
    const href = mailtoWithBcc(many, { maxTotalLength: 500 })
    expect(href).toBeNull()
  })

  it('respects DEFAULT_MAX_MAILTO_LENGTH by default', () => {
    const emails = Array.from({ length: 200 }, (_, i) => `u${i}@example.com`)
    const href = mailtoWithBcc(emails)
    expect(href).toBeNull()
    expect(
      mailtoWithBcc(['a@b.com'], { maxTotalLength: DEFAULT_MAX_MAILTO_LENGTH }),
    ).toMatch(/^mailto:\?/)
  })
})

describe('staffEmailsForMailto', () => {
  it('includes work email always and personal only when flag true', () => {
    expect(
      staffEmailsForMailto(
        [
          { email: 'w1@x.com', personal_email: 'p1@x.com' },
          { email: 'w2@x.com', personal_email: null },
        ],
        false,
      ),
    ).toEqual(['w1@x.com', 'w2@x.com'])

    expect(
      staffEmailsForMailto(
        [{ email: 'w@x.com', personal_email: 'p@x.com' }],
        true,
      ),
    ).toEqual(['w@x.com', 'p@x.com'])
  })
})

describe('formatEmailsAsCsv', () => {
  it('joins deduped addresses with commas', () => {
    expect(formatEmailsAsCsv(['a@x.com', 'b@x.com', 'a@x.com'])).toBe(
      'a@x.com,b@x.com',
    )
  })

  it('quotes fields that contain commas or quotes', () => {
    expect(formatEmailsAsCsv(['weird,local@x.com'])).toBe('"weird,local@x.com"')
    expect(formatEmailsAsCsv(['say"hi"@x.com'])).toBe('"say""hi""@x.com"')
  })
})

describe('guardianEmailsForMailto', () => {
  it('collects primary and secondary and dedupes', () => {
    expect(
      guardianEmailsForMailto([
        {
          primary_guardian: { email: 'a@x.com' },
          secondary_guardian: { email: 'a@x.com' },
        },
        {
          primary_guardian: { email: null },
          secondary_guardian: { email: 'b@x.com' },
        },
      ]),
    ).toEqual(['a@x.com', 'b@x.com'])
  })
})
