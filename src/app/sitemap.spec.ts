import { describe, it, expect, vi } from 'vitest'

vi.mock('@/data/contentfulClient', () => ({ contentfulClient: {} }))
vi.mock('@/data/contentful', () => ({ getPolicies: vi.fn() }))

import { getPolicies } from '@/data/contentful'

import sitemap from './sitemap'

describe('sitemap', () => {
  it('lists the homepage, the policies index and each published policy', async () => {
    vi.mocked(getPolicies).mockResolvedValue([
      {
        slug: 'privacy-policy',
        title: 'Privacy Notice',
        summary: 'Summary',
        version: '1.0',
        publishDate: '2026-10-03',
        pdf: { url: 'https://x/p.pdf', fileName: 'p.pdf', size: 1 },
      },
      {
        slug: 'unpublished',
        title: 'No PDF',
        summary: 'Summary',
        version: '1.0',
        publishDate: '2026-10-03',
        pdf: undefined,
      },
    ])

    const entries = await sitemap()

    expect(entries.map((e) => e.url)).toEqual([
      'https://www.hshb.org.uk',
      'https://www.hshb.org.uk/policies',
      'https://www.hshb.org.uk/policies/privacy-policy',
    ])
    expect(entries[2].lastModified).toEqual(new Date('2026-10-03'))
  })
})
