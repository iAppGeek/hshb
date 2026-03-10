import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'

import { updateStaff } from '@/db'

import { updateStaffAction } from './actions'

vi.mock('next/navigation', () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/db', () => ({
  updateStaff: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
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
  display_name: 'Ms Smith',
  contact_number: '07700 900001',
}

describe('updateStaffAction', () => {
  it('calls updateStaff with correct fields', async () => {
    vi.mocked(updateStaff).mockResolvedValue(undefined)

    await expect(
      updateStaffAction('staff-1', makeFormData(validFields)),
    ).rejects.toThrow('NEXT_REDIRECT:/portal/staff')

    expect(updateStaff).toHaveBeenCalledWith('staff-1', {
      first_name: 'Alice',
      last_name: 'Smith',
      email: 'alice@school.com',
      role: 'teacher',
      display_name: 'Ms Smith',
      contact_number: '07700 900001',
    })
  })

  it('treats empty optional fields as null', async () => {
    vi.mocked(updateStaff).mockResolvedValue(undefined)

    const fields = { ...validFields, display_name: '', contact_number: '' }

    await expect(
      updateStaffAction('staff-1', makeFormData(fields)),
    ).rejects.toThrow('NEXT_REDIRECT:/portal/staff')

    expect(updateStaff).toHaveBeenCalledWith(
      'staff-1',
      expect.objectContaining({ display_name: null, contact_number: null }),
    )
  })

  it('revalidates /portal/staff on success', async () => {
    vi.mocked(updateStaff).mockResolvedValue(undefined)

    await expect(
      updateStaffAction('staff-1', makeFormData(validFields)),
    ).rejects.toThrow('NEXT_REDIRECT:/portal/staff')

    expect(revalidatePath).toHaveBeenCalledWith('/portal/staff')
  })

  it('returns error when updateStaff throws', async () => {
    vi.mocked(updateStaff).mockRejectedValue(new Error('DB error'))

    const result = await updateStaffAction('staff-1', makeFormData(validFields))
    expect(result).toEqual({
      error: 'Failed to update staff member. Please try again.',
    })
  })
})
