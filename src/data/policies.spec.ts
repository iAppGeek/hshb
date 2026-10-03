import { describe, it, expect } from 'vitest'

import {
  formatFileSize,
  formatPolicyDate,
  POLICY_LINKS,
  policyPath,
  safePdfFileName,
} from './policies'

describe('policyPath', () => {
  it('builds the public URL path for a policy slug', () => {
    expect(policyPath('privacy-policy')).toBe('/policies/privacy-policy')
  })
})

describe('POLICY_LINKS', () => {
  it('links to the policies index and the privacy notice', () => {
    expect(POLICY_LINKS.map((l) => l.href)).toEqual([
      '/policies',
      '/policies/privacy-policy',
    ])
  })
})

describe('formatPolicyDate', () => {
  it('formats a Contentful date as a long British date', () => {
    expect(formatPolicyDate('2026-10-03')).toBe('3 October 2026')
  })

  it('does not shift the day for a date-only value', () => {
    expect(formatPolicyDate('2026-09-01')).toBe('1 September 2026')
  })
})

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(512)).toBe('512 B')
  })

  it('formats kilobytes, rounded', () => {
    expect(formatFileSize(507851)).toBe('496 KB')
  })

  it('formats megabytes to one decimal place', () => {
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB')
  })
})

describe('safePdfFileName', () => {
  it('keeps a plain file name unchanged', () => {
    expect(safePdfFileName('HSHB_Privacy_Notice_v1.0_FINAL.pdf')).toBe(
      'HSHB_Privacy_Notice_v1.0_FINAL.pdf',
    )
  })

  it('replaces characters that could break the header value', () => {
    expect(safePdfFileName('a "b";\r\nc.pdf')).toBe('a__b____c.pdf')
  })

  it('adds a .pdf extension when missing', () => {
    expect(safePdfFileName('policies')).toBe('policies.pdf')
  })
})
