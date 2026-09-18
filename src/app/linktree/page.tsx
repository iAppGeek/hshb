import { type Metadata } from 'next'

import { LinkTree } from '@/clientComponents/LinkTree'
import { parseStaffEmail, parseStaffLocalPart } from '@/data/linktree'

export const metadata: Metadata = {
  title: 'Links',
  description:
    'Quick links to the Hellenic School of High Barnet website, ClassDojo, registration and contact details.',
  alternates: { canonical: 'https://www.hshb.org.uk/linktree' },
  robots: { index: false, follow: false },
}

export default async function LinktreePage({
  searchParams,
}: PageProps<'/linktree'>): Promise<React.JSX.Element> {
  const { t } = await searchParams

  return (
    <LinkTree staff={parseStaffLocalPart(t)} staffEmail={parseStaffEmail(t)} />
  )
}
