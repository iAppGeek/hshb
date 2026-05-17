import type {
  Asset,
  ContentfulClientApi,
  Entry,
  EntryCollection,
  UnresolvedLink,
} from 'contentful'

import type {
  TypeAccordionEntrySkeleton,
  TypeAccordionSkeleton,
  TypeEventsSkeleton,
  TypePeopleSkeleton,
  TypeQuotesSkeleton,
  TypeTestimonialsSkeleton,
  TypeTextSkeleton,
} from '@/types/contentful'

export type CommunityMemeber = {
  priorityOrder: number
  name: string
  blurb: string | undefined
  extendedBlurb: string | undefined
  photo: string | undefined
  largeView: boolean
}
export type CommunityDirectory = { [key: string]: CommunityMemeber[] }

type MaybeAsset = Asset | UnresolvedLink<'Asset'> | undefined

// With `Modifiers = undefined`, AssetLink fields return either a resolved
// Asset or an unresolved sys-only stub. Treat the latter as missing.
const resolveAsset = (link: MaybeAsset): Asset | undefined =>
  link && 'fields' in link ? link : undefined

const getLinkedAssetUrl = (link: MaybeAsset): string | undefined => {
  const url = resolveAsset(link)?.fields?.file?.url
  return url ? `https:${url}` : undefined
}

let textCachePromise: Promise<
  EntryCollection<TypeTextSkeleton, undefined, string>
> | null = null

export const getTextSectionData = async (
  client: ContentfulClientApi<undefined>,
  sectionId: string,
): Promise<string> => {
  if (!textCachePromise) {
    textCachePromise = client.getEntries<TypeTextSkeleton>({
      content_type: 'text',
    })
  }
  const textCache = await textCachePromise

  const item = textCache.items.find((i) => i.fields.id === sectionId)
  return item ? item.fields.text : ''
}

export type FeaturedQuote = {
  text: string
  author: string
  role: string | undefined
}
export const getFeaturedQuotes = async (
  client: ContentfulClientApi<undefined>,
): Promise<FeaturedQuote[]> => {
  const entries = await client.getEntries<TypeQuotesSkeleton>({
    content_type: 'quotes',
  })
  return entries.items.map((entry) => ({
    author: entry.fields.author,
    role: entry.fields.role,
    text: entry.fields.text,
  }))
}

export const getCommunityDirectory = async (
  client: ContentfulClientApi<undefined>,
): Promise<CommunityDirectory> => {
  const people = await client.getEntries<TypePeopleSkeleton>({
    content_type: 'people',
  })
  const grouped = people.items.reduce((prev, curr) => {
    const role = curr.fields.role
    const member: CommunityMemeber = {
      priorityOrder: curr.fields.priorityOrder,
      blurb: curr.fields.blurb,
      extendedBlurb: curr.fields.extendedBlurb,
      name: `${curr.fields.firstName} ${curr.fields.lastName}`,
      photo: getLinkedAssetUrl(curr.fields.photo),
      largeView: !!curr.fields.largeView,
    }

    if (prev[role]) {
      return { ...prev, [role]: prev[role].concat(member) }
    } else {
      return { ...prev, [role]: [member] }
    }
  }, {} as CommunityDirectory)

  return grouped
}

export type PastEvent = {
  name: string
  date: Date
  description: string
  media: string[]
}
export const getEvents = async (
  client: ContentfulClientApi<undefined>,
): Promise<PastEvent[]> => {
  const entries = await client.getEntries<TypeEventsSkeleton>({
    content_type: 'events',
    limit: 3,
  })

  return entries.items.map((entry) => ({
    name: entry.fields.name,
    date: new Date(entry.fields.date),
    description: entry.fields.description,
    media:
      entry.fields.media
        ?.map(getLinkedAssetUrl)
        .filter((url): url is string => Boolean(url)) ?? [],
  }))
}

export type AccordianData = { title: string; body: string }[]
export const getAccordion = async (
  client: ContentfulClientApi<undefined>,
  name: string,
): Promise<AccordianData> => {
  const result = await client.getEntries<TypeAccordionSkeleton>({
    content_type: 'accordion',
    'fields.name[match]': name,
    limit: 1,
  })

  const entries = result.items[0]?.fields.entries
  if (!entries) return []

  return entries
    .filter(
      (e): e is Entry<TypeAccordionEntrySkeleton, undefined, string> =>
        'fields' in e,
    )
    .map((e) => ({ title: e.fields.title, body: e.fields.body }))
}

export type Author = {
  name: string
  role: string | undefined
  image: string | undefined
}
export type Testimonial = { title: string; text: string; author: Author }
export const getTestimonials = async (
  client: ContentfulClientApi<undefined>,
): Promise<Testimonial[]> => {
  const entries = await client.getEntries<TypeTestimonialsSkeleton>({
    content_type: 'testimonials',
  })

  return entries.items.map((e) => ({
    title: e.fields.title,
    text: e.fields.text,
    author: {
      name: e.fields.author,
      role: e.fields.role,
      image: getLinkedAssetUrl(e.fields.icon),
    },
  }))
}

export const getHeroVideo = async (
  client: ContentfulClientApi<undefined>,
): Promise<string | undefined> => {
  const entry = await client.getAsset('4thhwbtIQVSSwI1LDbONsJ')
  return entry.fields.file?.url
}
