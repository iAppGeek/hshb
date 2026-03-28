import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { createStaff } from '@/db'

import { createStaffAction } from './actions'

vi.mock('@/auth', () => ({ auth: vi.fn() }))

vi.mock('next/navigation', () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/db', () => ({
  createStaff: vi.fn(),
  logAuditEvent: vi.fn(),
}))

const adminSession = {
  user: { staffId: 'admin-1', role: 'admin' },
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue(adminSession as any)
})

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value)
  }
  return fd
}

const validFields = {
  first_name: 'Alice',
  last_name: 'Smith',
  email: 'alice@school.com',
  role: 'teacher',
  display_name: '',
  contact_number: '',
}

describe('createStaffAction', () => {
  it('returns error when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const result = await createStaffAction(makeFormData(validFields))
    expect(result).toEqual({ error: 'Not authenticated' })
    expect(createStaff).not.toHaveBeenCalled()
  })

  it('returns error when not authorised', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { staffId: 'teacher-1', role: 'teacher' },
    } as any)

    const result = await createStaffAction(makeFormData(validFields))
    expect(result).toEqual({ error: 'Not authorised' })
    expect(createStaff).not.toHaveBeenCalled()
  })

  it('calls createStaff with correct fields', async () => {
    vi.mocked(createStaff).mockResolvedValue({} as any)

    await expect(createStaffAction(makeFormData(validFields))).rejects.toThrow(
      'NEXT_REDIRECT:/portal/staff',
    )

    expect(createStaff).toHaveBeenCalledWith({
      first_name: 'Alice',
      last_name: 'Smith',
      email: 'alice@school.com',
      role: 'teacher',
      display_name: null,
      contact_number: null,
    })
  })

  it('revalidates /portal/staff on success', async () => {
    vi.mocked(createStaff).mockResolvedValue({} as any)

    await expect(createStaffAction(makeFormData(validFields))).rejects.toThrow(
      'NEXT_REDIRECT:/portal/staff',
    )

    expect(revalidatePath).toHaveBeenCalledWith('/portal/staff')
  })

  it('returns error when createStaff throws', async () => {
    vi.mocked(createStaff).mockRejectedValue(new Error('DB error'))

    const result = await createStaffAction(makeFormData(validFields))
    expect(result).toEqual({
      error: 'Failed to create staff member. Please try again.',
    })
  })
})
