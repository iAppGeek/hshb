import { describe, expect, it } from 'vitest'

import { buildLlmsTxt, cleanMarkdown, type LlmsContent } from '@/data/llms'

const makeContent = (overrides: Partial<LlmsContent> = {}): LlmsContent => ({
  summary: 'HSHB has been teaching children since 1977.',
  about: 'We offer a free trial.',
  admissions:
    '__Fees 2026 - 27__\n| Year | Fee |\n| --- | --- |\n| GCSE | £495.00 |',
  culture: 'Weekly __dance lessons__.',
  parentCommittee: 'The Parent Committee runs a tuck-shop.',
  directions: 'Near Cockfosters tube station.',
  phone: '+44 (0) 7753 829 692\n',
  faqs: [
    {
      id: 'faq-operating-hours',
      title: 'Operating Hours',
      body: '__Saturday__  9:30 to 13:00',
    },
  ],
  directory: {
    'Our Committee': [
      {
        priorityOrder: 102,
        name: 'Kris Erotokritou',
        blurb: 'Vice Chairman',
        extendedBlurb: undefined,
        photo: undefined,
        largeView: false,
      },
      {
        priorityOrder: 101,
        name: 'George  Keliris',
        blurb: 'Chairman',
        extendedBlurb: undefined,
        photo: undefined,
        largeView: false,
      },
    ],
  },
  events: [
    {
      name: 'Christmas Play',
      date: new Date('2025-12-13T00:00:00Z'),
      description: 'Our annual play. ',
      media: [],
    },
  ],
  ...overrides,
})

describe('cleanMarkdown', () => {
  it('removes images, trailing spaces and extra blank lines', () => {
    expect(
      cleanMarkdown(
        'Hello  \n\n\n\n![photo](//images.ctfassets.net/a.jpg)\nBye',
      ),
    ).toBe('Hello\n\nBye')
  })
})

describe('buildLlmsTxt', () => {
  it('starts with the llms.txt title and summary blockquote', () => {
    const lines = buildLlmsTxt(makeContent()).split('\n')

    expect(lines[0]).toBe('# Hellenic School of High Barnet (HSHB)')
    expect(lines[2]).toMatch(/^> A Greek language school in Cockfosters/)
  })

  it('answers the common parent questions', () => {
    const text = buildLlmsTxt(makeContent())

    expect(text).toContain('## Quick facts')
    expect(text).toContain('Founded: 1977')
    expect(text).toContain('Pupils: over 120 children')
    expect(text).toContain('5 Chestnut Grove, Cockfosters, Barnet, EN4 8PU')
    expect(text).toContain('HSHB has been teaching children since 1977.')
    expect(text).toContain('### Operating Hours')
    expect(text).toContain('__Saturday__  9:30 to 13:00')
    expect(text).toContain('| GCSE | £495.00 |')
    expect(text).toContain('Weekly __dance lessons__.')
    expect(text).toContain('Near Cockfosters tube station.')
    expect(text).toContain('- Email: info@hshb.org.uk')
    expect(text).toContain('- Phone: +44 (0) 7753 829 692\n')
  })

  it('links each FAQ to its deep-linkable anchor', () => {
    expect(buildLlmsTxt(makeContent())).toContain(
      'Source: https://www.hshb.org.uk/#faq-operating-hours',
    )
  })

  it('lists staff in priority order with tidied names', () => {
    const text = buildLlmsTxt(makeContent())

    expect(text).toContain(
      '### Our Committee\n\n- George Keliris: Chairman\n- Kris Erotokritou: Vice Chairman',
    )
  })

  it('lists staff without a blurb by name only', () => {
    const text = buildLlmsTxt(
      makeContent({
        directory: {
          'Our Teachers': [
            {
              priorityOrder: 1,
              name: 'Jenny Petridou',
              blurb: undefined,
              extendedBlurb: undefined,
              photo: undefined,
              largeView: false,
            },
          ],
        },
      }),
    )

    expect(text).toContain('### Our Teachers\n\n- Jenny Petridou\n')
  })

  it('lists recent events with ISO dates', () => {
    expect(buildLlmsTxt(makeContent())).toContain(
      '- Christmas Play (2025-12-13): Our annual play.',
    )
  })

  it('omits the events and staff sections when there is no content', () => {
    const text = buildLlmsTxt(makeContent({ events: [], directory: {} }))

    expect(text).not.toContain('## Recent events')
    expect(text).not.toContain('## Staff and committee')
  })

  it('links to the registration portal, policies and socials', () => {
    const text = buildLlmsTxt(makeContent())

    expect(text).toContain(
      '- Register a student: https://portal.hshb.org.uk/register',
    )
    expect(text).toContain('https://www.hshb.org.uk/policies')
    expect(text).toContain('https://instagram.hshb.org.uk/')
  })
})
