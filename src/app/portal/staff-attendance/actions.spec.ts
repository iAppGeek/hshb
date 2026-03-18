import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { signInStaff, signOutStaff } from '@/db'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/db', () => ({ signInStaff: vi.fn(), signOutStaff: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { signInAction, signOutAction } from './actions'

beforeEach(() => {
  vi.clearAllMocks()
})

function makeFormData(fields: Record<string, string>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.append(k, v)
  return fd
}

const teacherSession = {
  user: { staffId: 'staff-1', role: 'teacher' },
}
const adminSession = {
  user: { staffId: 'admin-1', role: 'admin' },
}

// ─── signInAction ─────────────────────────────────────────────────────────────

describe('signInAction', () => {
  it('signs in the authenticated staff member and revalidates', async () => {
    vi.mocked(auth).mockResolvedValue(teacherSession as any)
    vi.mocked(signInStaff).mockResolvedValue(undefined)

    const fd = makeFormData({
      staffId: 'staff-1',
      date: '2026-03-18',
      time: '09:00',
    })

    const result = await signInAction(fd)

    expect(result).toBeUndefined()
    expect(signInStaff).toHaveBeenCalledWith(
      'staff-1',
      '2026-03-18',
      '2026-03-18T09:00:00',
    )
    expect(revalidatePath).toHaveBeenCalledWith('/portal/staff-attendance')
  })

  it('returns error when teacher tries to sign in another staff member', async () => {
    vi.mocked(auth).mockResolvedValue(teacherSession as any)

    const fd = makeFormData({
      staffId: 'staff-2',
      date: '2026-03-18',
      time: '09:00',
    })

    const result = await signInAction(fd)

    expect(result).toEqual({ error: 'Not authorised' })
    expect(signInStaff).not.toHaveBeenCalled()
  })

  it('allows admin to sign in any staff member', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as any)
    vi.mocked(signInStaff).mockResolvedValue(undefined)

    const fd = makeFormData({
      staffId: 'staff-1',
      date: '2026-03-18',
      time: '09:00',
    })

    const result = await signInAction(fd)

    expect(result).toBeUndefined()
    expect(signInStaff).toHaveBeenCalledWith(
      'staff-1',
      '2026-03-18',
      '2026-03-18T09:00:00',
    )
  })

  it('returns error when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const fd = makeFormData({
      staffId: 'staff-1',
      date: '2026-03-18',
      time: '09:00',
    })
    const result = await signInAction(fd)

    expect(result).toEqual({ error: 'Not authenticated' })
    expect(signInStaff).not.toHaveBeenCalled()
  })

  it('returns error on DB failure', async () => {
    vi.mocked(auth).mockResolvedValue(teacherSession as any)
    vi.mocked(signInStaff).mockRejectedValue(new Error('DB error'))

    const fd = makeFormData({
      staffId: 'staff-1',
      date: '2026-03-18',
      time: '09:00',
    })
    const result = await signInAction(fd)

    expect(result).toEqual({ error: 'Failed to sign in. Please try again.' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('returns error when required fields are missing', async () => {
    vi.mocked(auth).mockResolvedValue(teacherSession as any)

    const fd = makeFormData({ staffId: 'staff-1', date: '2026-03-18' }) // no time
    const result = await signInAction(fd)

    expect(result).toEqual({ error: 'Missing required fields' })
    expect(signInStaff).not.toHaveBeenCalled()
  })
})

// ─── signOutAction ────────────────────────────────────────────────────────────

describe('signOutAction', () => {
  it('signs out the authenticated staff member and revalidates', async () => {
    vi.mocked(auth).mockResolvedValue(teacherSession as any)
    vi.mocked(signOutStaff).mockResolvedValue(undefined)

    const fd = makeFormData({
      staffId: 'staff-1',
      date: '2026-03-18',
      time: '17:00',
    })

    const result = await signOutAction(fd)

    expect(result).toBeUndefined()
    expect(signOutStaff).toHaveBeenCalledWith(
      'staff-1',
      '2026-03-18',
      '2026-03-18T17:00:00',
    )
    expect(revalidatePath).toHaveBeenCalledWith('/portal/staff-attendance')
  })

  it('returns error when teacher tries to sign out another staff member', async () => {
    vi.mocked(auth).mockResolvedValue(teacherSession as any)

    const fd = makeFormData({
      staffId: 'staff-2',
      date: '2026-03-18',
      time: '17:00',
    })
    const result = await signOutAction(fd)

    expect(result).toEqual({ error: 'Not authorised' })
    expect(signOutStaff).not.toHaveBeenCalled()
  })

  it('allows admin to sign out any staff member', async () => {
    vi.mocked(auth).mockResolvedValue(adminSession as any)
    vi.mocked(signOutStaff).mockResolvedValue(undefined)

    const fd = makeFormData({
      staffId: 'staff-1',
      date: '2026-03-18',
      time: '17:00',
    })
    const result = await signOutAction(fd)

    expect(result).toBeUndefined()
    expect(signOutStaff).toHaveBeenCalled()
  })

  it('returns error on DB failure', async () => {
    vi.mocked(auth).mockResolvedValue(teacherSession as any)
    vi.mocked(signOutStaff).mockRejectedValue(new Error('DB error'))

    const fd = makeFormData({
      staffId: 'staff-1',
      date: '2026-03-18',
      time: '17:00',
    })
    const result = await signOutAction(fd)

    expect(result).toEqual({ error: 'Failed to sign out. Please try again.' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
