import type {
  ContentfulClientApi,
  EntryCollection,
  EntrySkeletonType,
} from 'contentful'
import * as contentful from 'contentful'

import { getRandomInt } from './numbers'

export type CommunityMemeber = {
  priorityOrder: number
  name: string
  blurb: string
  photo: string
}
export type CommunityDirectory = { [key: string]: CommunityMemeber[] }

const getLinkedAssetUrl = (parentNode: contentful.Asset) => {
  return 'https:' + (parentNode['fields']!['file']!['url'] as string)
}

// Can be replaced with this?
// const getLinkedAssetUrl = (asset: contentful.Asset) => {
//   return asset?.fields?.file?.url
// }

let textCache: EntryCollection<EntrySkeletonType, undefined, string>
export const getTextSectionData = async (
  client: ContentfulClientApi<undefined>,
  sectionId: string,
) => {
  if (!textCache) {
    console.log('fetching text entries')
    textCache = await client.getEntries({ content_type: 'text' })
  }

  // get entry by "id" field
  const item = textCache.items.find((i) => i.fields['id'] === sectionId)
  return item ? (item.fields['text'] as string) : ''
}

//gets a single random entry from all quotes
export const getFeaturedQuote = async (
  client: ContentfulClientApi<undefined>,
) => {
  // get total count of quote entries
  console.log('fetching Featured Quote')
  const entriesCount = await client.getEntries({
    content_type: 'quotes',
    limit: 0,
  })
  // get random number in range of total entry count
  const rdm = getRandomInt(entriesCount.total)
  // get the one entry
  const entry = await client.getEntries({
    content_type: 'quotes',
    limit: 1,
    skip: rdm,
  })
  return {
    author: entry.items[0].fields['author'] as string,
    role: entry.items[0].fields['role'] as string,
    text: entry.items[0].fields['text'] as string,
  }
}

// gets all the people and groups by role (teacher or commitee)
export const getCommunityDirectory = async (
  client: ContentfulClientApi<undefined>,
) => {
  console.log('fetching Community Directory')
  const people = await client.getEntries({ content_type: 'people' })
  const grouped = people.items.reduce((prev, curr) => {
    const role = curr.fields['role'] as string
    const member: CommunityMemeber = {
      priorityOrder: curr.fields['priorityOrder'] as number,
      blurb: curr.fields['blurb'] as string,
      name: `${curr.fields['firstName']} ${curr.fields['lastName']}`,
      photo: getLinkedAssetUrl(
        curr.fields['photo'] as contentful.Asset,
      ) as string,
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
  date: string
  description: string
  media: string[]
}
export const getEvents = async (
  client: ContentfulClientApi<undefined>,
): Promise<PastEvent[]> => {
  console.log('fetching Events')
  const entries = await client.getEntries({ content_type: 'events', limit: 3 })

  const events = entries.items.map((entry) => ({
    name: entry.fields['name'],
    date: entry.fields['date'],
    description: entry.fields['description'],
    // @ts-expect-error - media is an array of assets?
    media: entry.fields['media']?.map(getLinkedAssetUrl),
  }))
  // @ts-expect-error - events is an array?
  return events
}
