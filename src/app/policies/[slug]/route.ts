import { getPolicy } from '@/data/contentful'
import { contentfulClient as client } from '@/data/contentfulClient'
import { safePdfFileName } from '@/data/policies'

// Never prerendered: the PDF is only fetched from Contentful when someone
// opens the link, not at build time or when a page linking here loads.
export const dynamic = 'force-dynamic'

type RouteProps = { params: Promise<{ slug: string }> }

// Streams the approved PDF from the clean /policies/<slug> URL, so the
// browser never sees (or depends on) the Contentful asset URL.
export async function GET(
  _request: Request,
  { params }: RouteProps,
): Promise<Response> {
  const { slug } = await params
  const policy = await getPolicy(client, slug)
  if (!policy) return new Response('Not found', { status: 404 })

  const upstream = await fetch(policy.pdf.url)
  if (!upstream.ok || !upstream.body) {
    return new Response('Document unavailable', { status: 502 })
  }

  const headers = new Headers({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${safePdfFileName(policy.pdf.fileName)}"`,
  })
  const length = upstream.headers.get('Content-Length')
  if (length) headers.set('Content-Length', length)

  return new Response(upstream.body, { headers })
}
