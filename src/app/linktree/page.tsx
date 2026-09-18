import { type Metadata } from 'next'

import { LinkTree } from '@/clientComponents/LinkTree'
import { parseStaffEmail, parseStaffLocalPart } from '@/data/linktree'

const title = 'Links'
const description =
  'Quick links to the Hellenic School of High Barnet website, ClassDojo, registration and contact details.'
const url = 'https://www.hshb.org.uk/linktree'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  // Not for search: this is a shareable link hub, not indexable content
  // (and `?t=` staff variants would otherwise create near-duplicate URLs).
  // `follow: true` still lets crawlers credit the pages it links to.
  robots: { index: false, follow: true },
  openGraph: {
    type: 'website',
    title,
    description,
    url,
    siteName: 'Hellenic School of High Barnet',
    images: [
      {
        url: '/linktree-og.png',
        width: 468,
        height: 468,
        alt: 'Hellenic School of High Barnet logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    site: '@HSHBInfo',
    title,
    description,
    images: ['/linktree-og.png'],
  },
}

export default async function LinktreePage({
  searchParams,
}: PageProps<'/linktree'>): Promise<React.JSX.Element> {
  const { t } = await searchParams

  return (
    <LinkTree staff={parseStaffLocalPart(t)} staffEmail={parseStaffEmail(t)} />
  )
}
