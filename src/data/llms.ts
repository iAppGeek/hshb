import type {
  AccordianData,
  CommunityDirectory,
  PastEvent,
} from '@/data/contentful'
import { LINKS, SCHOOL_EMAIL, SOCIAL_LINKS } from '@/data/linktree'
import { POLICIES_PATH } from '@/data/policies'

const SITE_URL = 'https://www.hshb.org.uk'

export type LlmsContent = {
  summary: string
  about: string
  admissions: string
  culture: string
  parentCommittee: string
  directions: string
  phone: string
  faqs: AccordianData
  directory: CommunityDirectory
  events: PastEvent[]
}

// Images add nothing for a text-only reader and the CMS stores them with
// protocol-relative URLs, so drop them rather than emit broken links.
const stripImages = (markdown: string): string =>
  markdown.replace(/!\[[^\]]*\]\([^)]*\)/g, '')

// Tidies CMS text: no images, no trailing spaces, no runs of blank lines.
export const cleanMarkdown = (markdown: string): string =>
  stripImages(markdown)
    .split('\n')
    .map((line): string => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

const section = (heading: string, body: string): string =>
  `## ${heading}\n\n${body}`

const faqSection = (faqs: AccordianData): string =>
  faqs
    .map(
      (faq): string =>
        `### ${faq.title}\n\n${cleanMarkdown(faq.body)}\n\nSource: ${SITE_URL}/#${faq.id}`,
    )
    .join('\n\n')

const staffSection = (directory: CommunityDirectory): string =>
  Object.entries(directory)
    .map(([group, members]): string => {
      const lines = [...members]
        .sort((a, b): number => a.priorityOrder - b.priorityOrder)
        .map((member): string => {
          const name = member.name.replace(/\s+/g, ' ').trim()
          const blurb = member.blurb?.replace(/\s+/g, ' ').trim()
          return blurb ? `- ${name}: ${blurb}` : `- ${name}`
        })
      return `### ${group}\n\n${lines.join('\n')}`
    })
    .join('\n\n')

const eventsSection = (events: PastEvent[]): string =>
  events
    .map((event): string => {
      const date = event.date.toISOString().slice(0, 10)
      return `- ${event.name} (${date}): ${event.description.trim()}`
    })
    .join('\n')

const registrationLink = LINKS.find((link) => link.id === 'registration')

export const buildLlmsTxt = (content: LlmsContent): string => {
  const quickFacts = [
    '- Name: Hellenic School of High Barnet (HSHB), also known as The Hellenic School @ Cockfosters',
    '- Type: Independent, part-time Greek language school run as a registered charity (no. 1053527) by a committee of parents',
    '- Founded: 1977',
    '- Pupils: over 120 children, from Nursery through to A Level',
    '- Average class size: 12',
    '- Exam pass rate: 95%',
    '- When: in person on Saturday mornings, plus online lessons on Wednesday evenings for Year 3 and above (exact times under "School day, term dates and FAQs")',
    '- Location: East Barnet School, 5 Chestnut Grove, Cockfosters, Barnet, EN4 8PU, United Kingdom',
    '- Areas served: Barnet, Enfield, Cockfosters, North London and Hertfordshire',
    `- Contact: ${SCHOOL_EMAIL} / ${content.phone.trim()}`,
    '- Free trial: a free, no-obligation in-person trial lesson is offered to children of all ages',
  ]

  const contact = [
    `- Email: ${SCHOOL_EMAIL}`,
    `- Phone: ${content.phone.trim()}`,
    `- Contact form: ${SITE_URL}/#contact`,
    ...(registrationLink
      ? [`- Register a student: ${registrationLink.href}`]
      : []),
    ...SOCIAL_LINKS.map((link): string => `- ${link.label}: ${link.href}`),
  ]

  const links = [
    `- [Home page](${SITE_URL}/): everything on this page in full, with photos and the events calendar`,
    `- [School policies and privacy notices](${SITE_URL}${POLICIES_PATH}): safeguarding, behaviour, complaints and data protection`,
    `- [Linktree](${SITE_URL}/linktree): quick links for parents`,
  ]

  return [
    '# Hellenic School of High Barnet (HSHB)',
    '> A Greek language school in Cockfosters, North London, teaching modern Greek language, history and culture to children from Nursery to A Level on Saturday mornings, with online lessons on Wednesday evenings.',
    section('Quick facts', quickFacts.join('\n')),
    section('About the school', cleanMarkdown(content.summary)),
    cleanMarkdown(content.about),
    section('School day, term dates and FAQs', faqSection(content.faqs)),
    section(
      'Fees, curriculum and enrolment',
      cleanMarkdown(content.admissions),
    ),
    section(
      'Activities and culture',
      `${cleanMarkdown(content.culture)}\n\n${cleanMarkdown(content.parentCommittee)}`,
    ),
    ...(content.events.length
      ? [section('Recent events', eventsSection(content.events))]
      : []),
    section(
      'Location and getting there',
      `The school meets at East Barnet School, 5 Chestnut Grove, Cockfosters, Barnet, EN4 8PU.\n\n${cleanMarkdown(content.directions)}`,
    ),
    section('Contact', contact.join('\n')),
    ...(Object.keys(content.directory).length
      ? [section('Staff and committee', staffSection(content.directory))]
      : []),
    section('Pages', links.join('\n')),
  ].join('\n\n')
}
