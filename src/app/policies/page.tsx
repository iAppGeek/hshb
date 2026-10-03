import { type Metadata } from 'next'
import Link from 'next/link'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

import { Container } from '@/components/Container'
import { getPolicies } from '@/data/contentful'
import { contentfulClient as client } from '@/data/contentfulClient'
import { formatFileSize, formatPolicyDate, policyPath } from '@/data/policies'
import { Footer } from '@/sections/Footer'

const title = 'School Policies'
const description =
  'School policies and privacy notices of the Hellenic School of High Barnet, including safeguarding, behaviour, complaints and how we use personal information.'
const url = 'https://www.hshb.org.uk/policies'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    type: 'website',
    title,
    description,
    url,
    siteName: 'Hellenic School of High Barnet',
  },
}

export default async function PoliciesPage(): Promise<React.JSX.Element> {
  const policies = await getPolicies(client)

  return (
    <>
      <main className="flex-auto py-16 sm:py-24">
        <Container>
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <span aria-hidden="true">&larr;</span> Back to home
          </Link>
          <h1 className="font-display mt-6 text-4xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            The policies that govern how the School is run, and how we look
            after the personal information of our families, staff and
            volunteers.
          </p>

          <ul className="mt-10 space-y-4">
            {policies.map((policy) => (
              <li key={policy.slug}>
                <a
                  href={policyPath(policy.slug)}
                  target="_blank"
                  rel="noopener"
                  className="flex gap-4 rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-900/5 transition hover:bg-blue-50"
                >
                  <DocumentTextIcon
                    aria-hidden="true"
                    className="size-8 shrink-0 text-blue-600"
                  />
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">
                      {policy.title}
                    </h2>
                    <p className="mt-1 text-slate-700">{policy.summary}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Version {policy.version} · Published{' '}
                      {formatPolicyDate(policy.publishDate)}
                      {policy.pdf.size !== undefined &&
                        ` · PDF, ${formatFileSize(policy.pdf.size)}`}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </main>
      <Footer />
    </>
  )
}
