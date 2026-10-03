import { type MetadataRoute } from 'next'

import { POLICIES_PATH } from '@/data/policies'

const siteUrl = 'https://www.hshb.org.uk'

export default function sitemap(): MetadataRoute.Sitemap {
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
  ]
}
