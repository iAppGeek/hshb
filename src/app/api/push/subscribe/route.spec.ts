import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/db', () => ({
  savePushSubscription: vi.fn(),
  deletePushSubscription: vi.fn(),
}))

import { auth } from '@/auth'
import { savePushSubscription, deletePushSubscription } from '@/db'

import { POST, DELETE } from './route'

beforeEach(() => {
  vi.clearAllMocks()
})

function makeRequest(body: unknown, method = 'POST'): Request {
  return new Request('https://example.com/api/push/subscribe', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const validBody = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
  keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
}

describe('POST /api/push/subscribe', () => {
  it('saves subscription and returns 201 for authenticated user with valid body', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: 'staff-1' } } as any)
    vi.mocked(savePushSubscription).mockResolvedValue(undefined)

    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(201)
    expect(savePushSubscription).toHaveBeenCalledWith({
      staff_id: 'staff-1',
      endpoint: validBody.endpoint,
      p256dh: validBody.keys.p256dh,
      auth: validBody.keys.auth,
    })
  })

  it('returns 401 when there is no session', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(401)
    expect(savePushSubscription).not.toHaveBeenCalled()
  })

  it('returns 400 when endpoint is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: 'staff-1' } } as any)

    const res = await POST(makeRequest({ keys: validBody.keys }))
    expect(res.status).toBe(400)
    expect(savePushSubscription).not.toHaveBeenCalled()
  })

  it('returns 400 when endpoint does not start with https://', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: 'staff-1' } } as any)

    const res = await POST(
      makeRequest({ ...validBody, endpoint: 'http://insecure.com' }),
    )
    expect(res.status).toBe(400)
    expect(savePushSubscription).not.toHaveBeenCalled()
  })

  it('returns 400 when p256dh is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: 'staff-1' } } as any)

    const res = await POST(
      makeRequest({ endpoint: validBody.endpoint, keys: { auth: 'auth-key' } }),
    )
    expect(res.status).toBe(400)
  })

  it('returns 400 when auth key is missing', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: 'staff-1' } } as any)

    const res = await POST(
      makeRequest({
        endpoint: validBody.endpoint,
        keys: { p256dh: 'p256dh-key' },
      }),
    )
    expect(res.status).toBe(400)
  })
})

describe('DELETE /api/push/subscribe', () => {
  it('deletes subscription and returns 200 for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { staffId: 'staff-1' } } as any)
    vi.mocked(deletePushSubscription).mockResolvedValue(undefined)

    const res = await DELETE(
      makeRequest({ endpoint: validBody.endpoint }, 'DELETE'),
    )
    expect(res.status).toBe(200)
    expect(deletePushSubscription).toHaveBeenCalledWith(validBody.endpoint)
  })

  it('returns 401 when there is no session', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const res = await DELETE(
      makeRequest({ endpoint: validBody.endpoint }, 'DELETE'),
    )
    expect(res.status).toBe(401)
    expect(deletePushSubscription).not.toHaveBeenCalled()
  })
})
