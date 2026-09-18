import { describe, expect, it } from 'vitest'

import {
  buildContactMailto,
  LINKS,
  parseStaffEmail,
  parseStaffLocalPart,
  SOCIAL_LINKS,
} from '@/data/linktree'

describe('parseStaffLocalPart', () => {
  it('accepts a plain local part', () => {
    expect(parseStaffLocalPart('jsmith')).toBe('jsmith')
  })

  it('normalises uppercase and surrounding whitespace', () => {
    expect(parseStaffLocalPart('  JSmith  ')).toBe('jsmith')
  })

  it('accepts dots, hyphens and underscores in the middle', () => {
    expect(parseStaffLocalPart('j.smith-anne_1')).toBe('j.smith-anne_1')
  })

  it('takes the first value when given an array', () => {
    expect(parseStaffLocalPart(['jsmith', 'other'])).toBe('jsmith')
  })

  it.each([
    ['undefined', undefined],
    ['empty string', ''],
    ['only whitespace', '   '],
    ['a full email address', 'jsmith@evil.com'],
    ['header injection via &', 'jsmith&bcc=x@evil.com'],
    ['percent-encoded @', 'jsmith%40evil.com'],
    ['a query string', 'jsmith?x=1'],
    ['leading dot', '.jsmith'],
    ['trailing hyphen', 'jsmith-'],
    ['spaces inside', 'j smith'],
    ['over-long value', 'a'.repeat(65)],
    ['empty array', []],
  ])('rejects %s', (_label, input) => {
    expect(parseStaffLocalPart(input)).toBeNull()
  })
})

describe('parseStaffEmail', () => {
  it('appends the staff domain to a valid local part', () => {
    expect(parseStaffEmail('jsmith')).toBe('jsmith@hshb.org.uk')
  })

  it('returns null for an invalid local part', () => {
    expect(parseStaffEmail('jsmith@evil.com')).toBeNull()
  })

  it('returns null when no value is given', () => {
    expect(parseStaffEmail(undefined)).toBeNull()
  })
})

describe('buildContactMailto', () => {
  it('mails the school with no cc when there is no staff email', () => {
    const href = buildContactMailto(null)
    expect(href).toBe(
      'mailto:info@hshb.org.uk?subject=Enquiry%20from%20a%20parent',
    )
  })

  it('CCs the staff email, url-encoded, when one is given', () => {
    const href = buildContactMailto('jsmith@hshb.org.uk')
    expect(href).toBe(
      'mailto:info@hshb.org.uk?subject=Enquiry%20from%20a%20parent&cc=jsmith%40hshb.org.uk',
    )
  })
})

describe('LINKS', () => {
  it('has a unique id for every link', () => {
    const ids = LINKS.map((link) => link.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has the homepage, registration and ClassDojo school signup links, in order', () => {
    const ids = LINKS.map((link) => link.id)
    expect(ids).toEqual(['homepage', 'registration', 'dojo-school-signup'])
  })
})

describe('SOCIAL_LINKS', () => {
  it('has the ClassDojo parent sign-in, instagram, facebook and x links, in order', () => {
    const ids = SOCIAL_LINKS.map((link) => link.id)
    expect(ids).toEqual(['dojo-parent-login', 'instagram', 'facebook', 'x'])
  })
})
