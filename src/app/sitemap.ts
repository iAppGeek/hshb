import { type MetadataRoute } from 'next'

import { getPolicies } from '@/data/contentful'
import { contentfulClient as client } from '@/data/contentfulClient'
import { POLICIES_PATH, policyPath } from '@/data/policies'

const siteUrl = 'https://www.hshb.org.uk'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const policies = (await getPolicies(client)).filter((p) => p.pdf)

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${siteUrl}${POLICIES_PATH}`,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    ...policies.map((policy) => ({
      url: `${siteUrl}${policyPath(policy.slug)}`,
      lastModified: new Date(policy.publishDate),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ]
}
