import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.hoisted(() => vi.fn())
vi.stubGlobal('fetch', mockFetch)

import {
  urlBase64ToUint8Array,
  saveSubscription,
  removeSubscription,
} from './push-client'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('urlBase64ToUint8Array', () => {
  it('converts a base64url string to a Uint8Array', () => {
    // 'hello' in base64url is 'aGVsbG8'
    const result = urlBase64ToUint8Array('aGVsbG8')
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result).toEqual(new Uint8Array([104, 101, 108, 108, 111]))
  })

  it('handles strings with - and _ (base64url encoding)', () => {
    // base64url uses - and _ instead of + and /
    const base64url =
      'BIA0zw8dfx72u4pG2qbg9myyD3TT298oNGs3FuwyP03e6Dktgl2i306TTu2l7Iw9koHPQxNeniQ4t5Ub18nSAsA'
    const result = urlBase64ToUint8Array(base64url)
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('saveSubscription', () => {
  it('POSTs the subscription JSON and resolves on ok response', async () => {
    mockFetch.mockResolvedValue({ ok: true })

    const mockSub = {
      toJSON: () => ({
        endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
        keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
      }),
    } as unknown as PushSubscription

    await expect(saveSubscription(mockSub)).resolves.toBeUndefined()
    expect(mockFetch).toHaveBeenCalledWith('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockSub.toJSON()),
    })
  })

  it('throws when fetch returns a non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 401 })

    const mockSub = {
      toJSON: () => ({ endpoint: 'https://example.com', keys: {} }),
    } as unknown as PushSubscription

    await expect(saveSubscription(mockSub)).rejects.toThrow(
      'Failed to save push subscription',
    )
  })
})

describe('removeSubscription', () => {
  it('sends a DELETE request with the endpoint and resolves on ok response', async () => {
    mockFetch.mockResolvedValue({ ok: true })

    await expect(
      removeSubscription('https://fcm.googleapis.com/fcm/send/abc'),
    ).resolves.toBeUndefined()
    expect(mockFetch).toHaveBeenCalledWith('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
      }),
    })
  })

  it('throws when fetch returns a non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })

    await expect(
      removeSubscription('https://fcm.googleapis.com/fcm/send/abc'),
    ).rejects.toThrow('Failed to remove push subscription')
  })
})
