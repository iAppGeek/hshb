import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/data/contentfulClient', () => ({ contentfulClient: {} }))
vi.mock('@/data/contentful', () => ({
  getPolicies: vi.fn(),
  getPolicy: vi.fn(),
}))

import { getPolicies, getPolicy, type Policy } from '@/data/contentful'

import { dynamicParams, generateStaticParams, GET } from './route'

const makePolicy = (overrides: Partial<Policy> = {}): Policy => ({
  slug: 'privacy-policy',
  title: 'Privacy Notice',
  summary: 'How we use your information',
  version: '1.0',
  publishDate: '2026-10-03',
  pdf: {
    url: 'https://assets.ctfassets.net/x/privacy.pdf',
    fileName: 'HSHB_Privacy_Notice_v1.0_FINAL.pdf',
    size: 3,
  },
  ...overrides,
})

const callGet = (slug: string): Promise<Response> =>
  GET(new Request(`http://localhost/policies/${slug}`), {
    params: Promise.resolve({ slug }),
  })

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('/policies/[slug] route', () => {
  it('only serves prerendered slugs', () => {
    expect(dynamicParams).toBe(false)
  })

  it('generates params for every policy that has a PDF', async () => {
    vi.mocked(getPolicies).mockResolvedValue([
      makePolicy({ slug: 'school-policies' }),
      makePolicy({ slug: 'no-pdf', pdf: undefined }),
    ])

    expect(await generateStaticParams()).toEqual([{ slug: 'school-policies' }])
  })

  it('streams the PDF unchanged, inline, with its file name', async () => {
    vi.mocked(getPolicy).mockResolvedValue(makePolicy())
    const bytes = new Uint8Array([37, 80, 68])
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(bytes, { status: 200 }))

    const res = await callGet('privacy-policy')

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://assets.ctfassets.net/x/privacy.pdf',
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('application/pdf')
    expect(res.headers.get('Content-Disposition')).toBe(
      'inline; filename="HSHB_Privacy_Notice_v1.0_FINAL.pdf"',
    )
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(bytes)
  })

  it('returns 404 for an unknown policy', async () => {
    vi.mocked(getPolicy).mockResolvedValue(undefined)

    const res = await callGet('missing')
    expect(res.status).toBe(404)
  })

  it('returns 404 when the policy has no PDF', async () => {
    vi.mocked(getPolicy).mockResolvedValue(makePolicy({ pdf: undefined }))

    const res = await callGet('privacy-policy')
    expect(res.status).toBe(404)
  })

  it('returns 502 when the PDF cannot be fetched', async () => {
    vi.mocked(getPolicy).mockResolvedValue(makePolicy())
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 500 }),
    )

    const res = await callGet('privacy-policy')
    expect(res.status).toBe(502)
  })
})
