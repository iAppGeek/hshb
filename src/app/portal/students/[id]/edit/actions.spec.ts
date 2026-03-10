import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createGuardian, updateStudent } from '@/db'

import { updateStudentAction } from './actions'

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/db', () => ({
  createGuardian: vi.fn(),
  updateStudent: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function makeFormData(fields: Record<string, string | string[]>): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      value.forEach((v) => fd.append(key, v))
    } else {
      fd.set(key, value)
    }
  }
  return fd
}

const baseFields = {
  student_first_name: 'Anna',
  student_last_name: 'Smith',
  student_code: 'S001',
  student_date_of_birth: '',
  student_address_line_1: '1 Main Street',
  student_address_line_2: '',
  student_city: 'London',
  student_postcode: 'EC1A 1BB',
  student_allergies: '',
  student_medical_details: '',
  student_notes: '',
  primary_mode: 'existing',
  primary_existing_id: 'guardian-1',
  primary_relationship: 'Mother',
  has_secondary: 'false',
  has_contact1: 'false',
  has_contact2: 'false',
}

describe('updateStudentAction', () => {
  it('updates student and redirects on success', async () => {
    vi.mocked(updateStudent).mockResolvedValue(undefined)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      updateStudentAction('student-1', makeFormData(baseFields)),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(updateStudent).toHaveBeenCalledWith(
      'student-1',
      expect.objectContaining({
        first_name: 'Anna',
        last_name: 'Smith',
        primary_guardian_id: 'guardian-1',
      }),
    )
    expect(revalidatePath).toHaveBeenCalledWith('/portal/students')
    expect(redirect).toHaveBeenCalledWith('/portal/students')
  })

  it('creates a new guardian when mode is new', async () => {
    vi.mocked(createGuardian).mockResolvedValue({ id: 'new-guardian-id' })
    vi.mocked(updateStudent).mockResolvedValue(undefined)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    const fields = {
      ...baseFields,
      primary_mode: 'new',
      primary_first_name: 'Jane',
      primary_last_name: 'Doe',
      primary_phone: '07700 900000',
      primary_email: 'jane@example.com',
    }

    await expect(
      updateStudentAction('student-1', makeFormData(fields)),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(createGuardian).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'Jane',
        last_name: 'Doe',
      }),
    )
    expect(updateStudent).toHaveBeenCalledWith(
      'student-1',
      expect.objectContaining({
        primary_guardian_id: 'new-guardian-id',
      }),
    )
  })

  it('returns error when update throws', async () => {
    vi.mocked(updateStudent).mockRejectedValue(new Error('DB error'))

    const result = await updateStudentAction(
      'student-1',
      makeFormData(baseFields),
    )
    expect(result).toEqual({
      error: 'Failed to save student. Please try again.',
    })
    expect(redirect).not.toHaveBeenCalled()
  })
})
