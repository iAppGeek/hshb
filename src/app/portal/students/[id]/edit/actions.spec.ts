import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { createGuardian, updateStudent, updateStudentClasses } from '@/db'

import { updateStudentAction } from './actions'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/db', () => ({
  createGuardian: vi.fn(),
  updateStudent: vi.fn(),
  updateStudentClasses: vi.fn(),
  logAuditEvent: vi.fn(),
}))

const STUDENT_ID = '00000000-0000-4000-8000-000000000001'
const GUARDIAN_1 = '00000000-0000-4000-8000-000000000010'
const NEW_GUARDIAN = '00000000-0000-4000-8000-000000000020'
const CLASS_1 = '00000000-0000-4000-8000-000000000030'
const CLASS_2 = '00000000-0000-4000-8000-000000000040'

const adminSession = { user: { staffId: 'admin-1', role: 'admin' } }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue(adminSession as any)
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

const baseFields: Record<string, string> = {
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
  primary_existing_id: GUARDIAN_1,
  primary_relationship: 'Mother',
  has_secondary: 'false',
  has_contact1: 'false',
  has_contact2: 'false',
}

describe('updateStudentAction', () => {
  it('returns error when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const result = await updateStudentAction(
      STUDENT_ID,
      makeFormData(baseFields),
    )
    expect(result).toEqual({ error: 'Not authenticated' })
    expect(updateStudent).not.toHaveBeenCalled()
  })

  it('returns error when not authorised', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { staffId: 'teacher-1', role: 'teacher' },
    } as any)

    const result = await updateStudentAction(
      STUDENT_ID,
      makeFormData(baseFields),
    )
    expect(result).toEqual({ error: 'Not authorised' })
    expect(updateStudent).not.toHaveBeenCalled()
  })

  it('updates student and redirects on success', async () => {
    vi.mocked(updateStudent).mockResolvedValue(undefined)
    vi.mocked(updateStudentClasses).mockResolvedValue(undefined)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      updateStudentAction(STUDENT_ID, makeFormData(baseFields)),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(updateStudent).toHaveBeenCalledWith(
      STUDENT_ID,
      expect.objectContaining({
        first_name: 'Anna',
        last_name: 'Smith',
        primary_guardian_id: GUARDIAN_1,
      }),
    )
    expect(revalidatePath).toHaveBeenCalledWith('/portal/students')
    expect(redirect).toHaveBeenCalledWith('/portal/students')
  })

  it('updates class enrollments with submitted class ids', async () => {
    vi.mocked(updateStudent).mockResolvedValue(undefined)
    vi.mocked(updateStudentClasses).mockResolvedValue(undefined)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    const fields = { ...baseFields, class_ids: [CLASS_1, CLASS_2] }

    await expect(
      updateStudentAction(STUDENT_ID, makeFormData(fields)),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(updateStudentClasses).toHaveBeenCalledWith(STUDENT_ID, [
      CLASS_1,
      CLASS_2,
    ])
  })

  it('creates a new guardian when mode is new', async () => {
    vi.mocked(createGuardian).mockResolvedValue({ id: NEW_GUARDIAN })
    vi.mocked(updateStudent).mockResolvedValue(undefined)
    vi.mocked(updateStudentClasses).mockResolvedValue(undefined)
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
      updateStudentAction(STUDENT_ID, makeFormData(fields)),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(createGuardian).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'Jane',
        last_name: 'Doe',
      }),
    )
    expect(updateStudent).toHaveBeenCalledWith(
      STUDENT_ID,
      expect.objectContaining({
        primary_guardian_id: NEW_GUARDIAN,
      }),
    )
  })

  it('returns error when update throws', async () => {
    vi.mocked(updateStudent).mockRejectedValue(new Error('DB error'))
    vi.mocked(updateStudentClasses).mockResolvedValue(undefined)

    const result = await updateStudentAction(
      STUDENT_ID,
      makeFormData(baseFields),
    )
    expect(result).toEqual({
      error: 'Failed to save student. Please try again.',
    })
    expect(redirect).not.toHaveBeenCalled()
  })
})
