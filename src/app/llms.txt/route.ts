import {
  getAccordion,
  getCommunityDirectory,
  getEvents,
  getTextSectionData,
} from '@/data/contentful'
import { contentfulClient as client } from '@/data/contentfulClient'
import { buildLlmsTxt } from '@/data/llms'

// Built once at deploy time from the same Contentful content as the home page.
export const dynamic = 'force-static'

export async function GET(): Promise<Response> {
  const [
    summary,
    about,
    admissions,
    culture,
    parentCommittee,
    directions,
    phone,
    faqs,
    directory,
    events,
  ] = await Promise.all([
    getTextSectionData(client, 'hero-section'),
    getTextSectionData(client, 'aboutUs-blurb'),
    getTextSectionData(client, 'admissions-blurb'),
    getTextSectionData(client, 'aboutUs-highlighted-1'),
    getTextSectionData(client, 'aboutUs-highlighted-2'),
    getTextSectionData(client, 'contact-text'),
    getTextSectionData(client, 'contact-number'),
    getAccordion(client, 'About Us'),
    getCommunityDirectory(client),
    getEvents(client),
  ])

  const body = buildLlmsTxt({
    summary,
    about,
    admissions,
    culture,
    parentCommittee,
    directions,
    phone,
    faqs,
    directory,
    events,
  })

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
