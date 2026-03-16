import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('./client', () => ({
  supabase: { from: mockFrom },
}))

import {
  savePushSubscription,
  deletePushSubscription,
  getAdminSubscriptions,
} from './push-subscriptions'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockRow = {
  id: 'sub-1',
  staff_id: 'staff-1',
  endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
  p256dh: 'p256dh-key',
  auth: 'auth-key',
  created_at: '2024-03-08T10:00:00Z',
}

describe('savePushSubscription', () => {
  it('upserts a subscription without throwing', async () => {
    mockFrom.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })

    await expect(
      savePushSubscription({
        staff_id: 'staff-1',
        endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
        p256dh: 'p256dh-key',
        auth: 'auth-key',
      }),
    ).resolves.toBeUndefined()
    expect(mockFrom).toHaveBeenCalledWith('push_subscriptions')
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      upsert: vi
        .fn()
        .mockResolvedValue({ error: { message: 'Upsert failed' } }),
    })

    await expect(
      savePushSubscription({
        staff_id: 'staff-1',
        endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
        p256dh: 'p256dh-key',
        auth: 'auth-key',
      }),
    ).rejects.toEqual({ message: 'Upsert failed' })
  })
})

describe('deletePushSubscription', () => {
  it('deletes a subscription by endpoint without throwing', async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    })

    await expect(
      deletePushSubscription('https://fcm.googleapis.com/fcm/send/abc'),
    ).resolves.toBeUndefined()
    expect(mockFrom).toHaveBeenCalledWith('push_subscriptions')
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
      }),
    })

    await expect(
      deletePushSubscription('https://fcm.googleapis.com/fcm/send/abc'),
    ).rejects.toEqual({ message: 'Delete failed' })
  })
})

describe('getAdminSubscriptions', () => {
  it('returns admin and headteacher subscriptions', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({ data: [mockRow], error: null }),
      }),
    })

    const result = await getAdminSubscriptions()
    expect(result).toEqual([mockRow])
    expect(mockFrom).toHaveBeenCalledWith('push_subscriptions')
  })

  it('returns empty array when no eligible subscriptions exist', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    })

    const result = await getAdminSubscriptions()
    expect(result).toEqual([])
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Query failed' },
        }),
      }),
    })

    await expect(getAdminSubscriptions()).rejects.toEqual({
      message: 'Query failed',
    })
  })
})
