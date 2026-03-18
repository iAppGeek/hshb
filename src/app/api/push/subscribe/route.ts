import { auth } from '@/auth'
import {
  deletePushSubscription,
  pushSubscriptionExists,
  savePushSubscription,
} from '@/db'

export async function GET(req: Request): Promise<Response> {
  const session = await auth()
  if (!session?.user?.staffId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const endpoint = searchParams.get('endpoint')
  if (!endpoint) {
    return Response.json({ error: 'Missing endpoint' }, { status: 400 })
  }

  const exists = await pushSubscriptionExists(endpoint)
  return Response.json({ exists })
}

export async function POST(req: Request): Promise<Response> {
  const session = await auth()
  if (!session?.user?.staffId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  if (
    typeof body?.endpoint !== 'string' ||
    !body.endpoint.startsWith('https://') ||
    typeof body?.keys?.p256dh !== 'string' ||
    body.keys.p256dh.length === 0 ||
    typeof body?.keys?.auth !== 'string' ||
    body.keys.auth.length === 0
  ) {
    return Response.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  await savePushSubscription({
    staff_id: session.user.staffId,
    endpoint: body.endpoint,
    p256dh: body.keys.p256dh,
    auth: body.keys.auth,
  })

  return Response.json({ ok: true }, { status: 201 })
}

export async function DELETE(req: Request): Promise<Response> {
  const session = await auth()
  if (!session?.user?.staffId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { endpoint } = await req.json()
  await deletePushSubscription(endpoint)

  return Response.json({ ok: true })
}
