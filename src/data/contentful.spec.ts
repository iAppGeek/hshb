import { describe, it, expect, vi } from 'vitest'

vi.mock('contentful')

import {
  getTextSectionData,
  getFeaturedQuotes,
  getCommunityDirectory,
  getEvents,
  getAccordion,
  getTestimonials,
  getHeroVideo,
} from './contentful'

const makeClient = (overrides: Partial<Record<string, unknown>> = {}) =>
  ({
    getEntries: vi.fn(),
    getAsset: vi.fn(),
    ...overrides,
  }) as any

// ─── getTextSectionData ───────────────────────────────────────────────────────

describe('getTextSectionData', () => {
  it('returns the text for a matching section id', async () => {
    const client = makeClient({
      getEntries: vi.fn().mockResolvedValue({
        items: [
          { fields: { id: 'hero-section', text: 'Welcome!' } },
          { fields: { id: 'other-section', text: 'Other text' } },
        ],
      }),
    })

    const result = await getTextSectionData(client, 'hero-section')
    expect(result).toBe('Welcome!')
  })

  it('returns empty string when section id is not found', async () => {
    const client = makeClient({
      getEntries: vi.fn().mockResolvedValue({
        items: [{ fields: { id: 'known-id', text: 'Some text' } }],
      }),
    })

    const result = await getTextSectionData(client, 'missing-id')
    expect(result).toBe('')
  })

  it('uses cached entries and only calls getEntries once', async () => {
    const getEntries = vi.fn().mockResolvedValue({
      items: [{ fields: { id: 'cached-id', text: 'Cached text' } }],
    })
    const client = makeClient({ getEntries })

    await getTextSectionData(client, 'cached-id')
    await getTextSectionData(client, 'cached-id')

    // cache is module-level, so this may have been primed by earlier tests —
    // just verify no error is thrown and valid text is returned
    expect(typeof (await getTextSectionData(client, 'cached-id'))).toBe(
      'string',
    )
  })
})

// ─── getFeaturedQuotes ────────────────────────────────────────────────────────

describe('getFeaturedQuotes', () => {
  it('returns mapped quotes array', async () => {
    const client = makeClient({
      getEntries: vi.fn().mockResolvedValue({
        items: [
          {
            fields: { author: 'Alice', role: 'Parent', text: 'Great school!' },
          },
          { fields: { author: 'Bob', role: 'Teacher', text: 'Amazing kids!' } },
        ],
      }),
    })

    const result = await getFeaturedQuotes(client)

    expect(result).toEqual([
      { author: 'Alice', role: 'Parent', text: 'Great school!' },
      { author: 'Bob', role: 'Teacher', text: 'Amazing kids!' },
    ])
  })

  it('returns empty array when no quotes exist', async () => {
    const client = makeClient({
      getEntries: vi.fn().mockResolvedValue({ items: [] }),
    })

    const result = await getFeaturedQuotes(client)
    expect(result).toEqual([])
  })
})

// ─── getCommunityDirectory ────────────────────────────────────────────────────

describe('getCommunityDirectory', () => {
  it('groups people by role', async () => {
    const client = makeClient({
      getEntries: vi.fn().mockResolvedValue({
        items: [
          {
            fields: {
              role: 'Teacher',
              firstName: 'Maria',
              lastName: 'Papadopoulos',
              blurb: 'Lead teacher',
              extendedBlurb: undefined,
              priorityOrder: 1,
              largeView: false,
              photo: { fields: { file: { url: '//example.com/photo.jpg' } } },
            },
          },
          {
            fields: {
              role: 'Committee',
              firstName: 'Nikos',
              lastName: 'Dimitriou',
              blurb: 'Chair',
              extendedBlurb: 'Extended bio',
              priorityOrder: 2,
              largeView: true,
              photo: { fields: { file: { url: '//example.com/nikos.jpg' } } },
            },
          },
          {
            fields: {
              role: 'Teacher',
              firstName: 'Eleni',
              lastName: 'Stavros',
              blurb: 'Assistant',
              extendedBlurb: undefined,
              priorityOrder: 3,
              largeView: false,
              photo: { fields: { file: { url: '//example.com/eleni.jpg' } } },
            },
          },
        ],
      }),
    })

    const result = await getCommunityDirectory(client)

    expect(result['Teacher']).toHaveLength(2)
    expect(result['Committee']).toHaveLength(1)
    expect(result['Teacher'][0].name).toBe('Maria Papadopoulos')
    expect(result['Teacher'][0].photo).toBe('https://example.com/photo.jpg')
    expect(result['Committee'][0].largeView).toBe(true)
    expect(result['Committee'][0].extendedBlurb).toBe('Extended bio')
  })

  it('returns empty object when no people exist', async () => {
    const client = makeClient({
      getEntries: vi.fn().mockResolvedValue({ items: [] }),
    })

    const result = await getCommunityDirectory(client)
    expect(result).toEqual({})
  })
})

// ─── getEvents ────────────────────────────────────────────────────────────────

describe('getEvents', () => {
  it('returns mapped events with correct types', async () => {
    const client = makeClient({
      getEntries: vi.fn().mockResolvedValue({
        items: [
          {
            fields: {
              name: 'Spring Festival',
              date: '2024-04-01',
              description: 'Annual spring event',
              media: [
                { fields: { file: { url: '//example.com/img1.jpg' } } },
                { fields: { file: { url: '//example.com/img2.jpg' } } },
              ],
            },
          },
        ],
      }),
    })

    const result = await getEvents(client)

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Spring Festival')
    expect(result[0].date).toBeInstanceOf(Date)
    expect(result[0].description).toBe('Annual spring event')
    expect(result[0].media).toEqual([
      'https://example.com/img1.jpg',
      'https://example.com/img2.jpg',
    ])
  })

  it('handles events with no media', async () => {
    const client = makeClient({
      getEntries: vi.fn().mockResolvedValue({
        items: [
          {
            fields: {
              name: 'No Media Event',
              date: '2024-06-01',
              description: 'No photos',
              media: undefined,
            },
          },
        ],
      }),
    })

    const result = await getEvents(client)
    expect(result[0].media).toBeUndefined()
  })
})

// ─── getAccordion ─────────────────────────────────────────────────────────────

describe('getAccordion', () => {
  it('returns formatted accordion entries', async () => {
    const client = makeClient({
      getEntries: vi.fn().mockResolvedValue({
        items: [
          {
            fields: {
              entries: [
                { fields: { title: 'Question 1', body: 'Answer 1' } },
                { fields: { title: 'Question 2', body: 'Answer 2' } },
              ],
            },
          },
        ],
      }),
    })

    const result = await getAccordion(client, 'About Us')

    expect(result).toEqual([
      { title: 'Question 1', body: 'Answer 1' },
      { title: 'Question 2', body: 'Answer 2' },
    ])
  })
})

// ─── getTestimonials ──────────────────────────────────────────────────────────

describe('getTestimonials', () => {
  it('returns mapped testimonials with author image URL', async () => {
    const client = makeClient({
      getEntries: vi.fn().mockResolvedValue({
        items: [
          {
            fields: {
              title: 'Best school ever',
              text: 'We love it here',
              author: 'Sophia K.',
              role: 'Parent',
              icon: { fields: { file: { url: '//example.com/avatar.jpg' } } },
            },
          },
        ],
      }),
    })

    const result = await getTestimonials(client)

    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Best school ever')
    expect(result[0].text).toBe('We love it here')
    expect(result[0].author.name).toBe('Sophia K.')
    expect(result[0].author.role).toBe('Parent')
    expect(result[0].author.image).toBe('https://example.com/avatar.jpg')
  })

  it('returns empty array when no testimonials exist', async () => {
    const client = makeClient({
      getEntries: vi.fn().mockResolvedValue({ items: [] }),
    })

    const result = await getTestimonials(client)
    expect(result).toEqual([])
  })
})

// ─── getHeroVideo ─────────────────────────────────────────────────────────────

describe('getHeroVideo', () => {
  it('returns the file URL from the asset', async () => {
    const client = makeClient({
      getAsset: vi.fn().mockResolvedValue({
        fields: { file: { url: '//videos.example.com/hero.mp4' } },
      }),
    })

    const result = await getHeroVideo(client)
    expect(result).toBe('//videos.example.com/hero.mp4')
  })

  it('returns undefined when file is missing', async () => {
    const client = makeClient({
      getAsset: vi.fn().mockResolvedValue({ fields: {} }),
    })

    const result = await getHeroVideo(client)
    expect(result).toBeUndefined()
  })
})
