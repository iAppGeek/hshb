import { getPolicies, getPolicy } from '@/data/contentful'
import { contentfulClient as client } from '@/data/contentfulClient'
import { safePdfFileName } from '@/data/policies'

// Every published policy is prerendered at build time, like the rest of the
// site's Contentful content; unknown slugs 404 rather than hitting Contentful.
export const dynamicParams = false

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const policies = await getPolicies(client)
  return policies.filter((p) => p.pdf).map(({ slug }) => ({ slug }))
}

type RouteProps = { params: Promise<{ slug: string }> }

// Serves the approved PDF byte-for-byte from the clean /policies/<slug> URL,
// so shared links never expose (or depend on) the Contentful asset URL.
export async function GET(
  _request: Request,
  { params }: RouteProps,
): Promise<Response> {
  const { slug } = await params
  const policy = await getPolicy(client, slug)
  if (!policy?.pdf) return new Response('Not found', { status: 404 })

  const upstream = await fetch(policy.pdf.url)
  if (!upstream.ok) {
    return new Response('Document unavailable', { status: 502 })
  }

  return new Response(await upstream.arrayBuffer(), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${safePdfFileName(policy.pdf.fileName)}"`,
    },
  })
}
