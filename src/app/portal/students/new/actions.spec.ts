import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createGuardian, createStudent } from '@/db'

import { createStudentAction } from './actions'

vi.mock('@/db', () => ({
  createGuardian: vi.fn(),
  createStudent: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

const GUARDIAN_1 = '00000000-0000-4000-8000-000000000001'
const GUARDIAN_2 = '00000000-0000-4000-8000-000000000002'
const CONTACT_1 = '00000000-0000-4000-8000-000000000003'
const STUDENT_ID = '00000000-0000-4000-8000-000000000010'
const GUARDIAN_EXISTING = '00000000-0000-4000-8000-000000000099'

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

const baseFields = {
  student_first_name: 'Anna',
  student_last_name: 'Smith',
  student_code: '',
  student_date_of_birth: '',
  student_address_line_1: '1 Main Street',
  student_address_line_2: '',
  student_city: 'London',
  student_postcode: 'EC1A 1BB',
  student_allergies: '',
  student_medical_details: '',
  student_notes: '',
  primary_first_name: 'Maria',
  primary_last_name: 'Smith',
  primary_phone: '07700 900000',
  primary_email: 'maria@example.com',
  primary_address_line_1: '',
  primary_address_line_2: '',
  primary_city: '',
  primary_postcode: '',
  primary_relationship: 'Mother',
  has_secondary: 'false',
  has_contact1: 'false',
  has_contact2: 'false',
}

describe('createStudentAction', () => {
  it('creates primary guardian and student, then redirects', async () => {
    vi.mocked(createGuardian).mockResolvedValue({ id: GUARDIAN_1 } as any)
    vi.mocked(createStudent).mockResolvedValue({ id: STUDENT_ID } as any)

    await createStudentAction(makeFormData(baseFields))

    expect(createGuardian).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'Maria',
        last_name: 'Smith',
        phone: '07700 900000',
        email: 'maria@example.com',
      }),
    )
    expect(createStudent).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'Anna',
        last_name: 'Smith',
        primary_guardian_id: GUARDIAN_1,
        primary_guardian_relationship: 'Mother',
        secondary_guardian_id: null,
        additional_contact_1_id: null,
        additional_contact_2_id: null,
      }),
    )
    expect(revalidatePath).toHaveBeenCalledWith('/portal/students')
    expect(redirect).toHaveBeenCalledWith('/portal/students')
  })

  it('creates secondary guardian when has_secondary is true', async () => {
    vi.mocked(createGuardian)
      .mockResolvedValueOnce({ id: GUARDIAN_1 } as any)
      .mockResolvedValueOnce({ id: GUARDIAN_2 } as any)
    vi.mocked(createStudent).mockResolvedValue({ id: STUDENT_ID } as any)

    await createStudentAction(
      makeFormData({
        ...baseFields,
        has_secondary: 'true',
        secondary_first_name: 'George',
        secondary_last_name: 'Smith',
        secondary_phone: '07700 900001',
        secondary_email: '',
        secondary_address_line_1: '',
        secondary_address_line_2: '',
        secondary_city: '',
        secondary_postcode: '',
      }),
    )

    expect(createGuardian).toHaveBeenCalledTimes(2)
    expect(createStudent).toHaveBeenCalledWith(
      expect.objectContaining({ secondary_guardian_id: GUARDIAN_2 }),
    )
  })

  it('creates additional contact 1 when has_contact1 is true', async () => {
    vi.mocked(createGuardian)
      .mockResolvedValueOnce({ id: GUARDIAN_1 } as any)
      .mockResolvedValueOnce({ id: CONTACT_1 } as any)
    vi.mocked(createStudent).mockResolvedValue({ id: STUDENT_ID } as any)

    await createStudentAction(
      makeFormData({
        ...baseFields,
        has_contact1: 'true',
        contact1_first_name: 'Uncle',
        contact1_last_name: 'Bob',
        contact1_phone: '07700 900002',
      }),
    )

    expect(createStudent).toHaveBeenCalledWith(
      expect.objectContaining({ additional_contact_1_id: CONTACT_1 }),
    )
  })

  it('returns an error object when creation fails', async () => {
    vi.mocked(createGuardian).mockRejectedValue(new Error('DB error'))

    const result = await createStudentAction(makeFormData(baseFields))

    expect(result).toEqual({
      error: 'Failed to save student. Please try again.',
    })
    expect(redirect).not.toHaveBeenCalled()
  })

  it('converts empty strings to null for optional fields', async () => {
    vi.mocked(createGuardian).mockResolvedValue({ id: GUARDIAN_1 } as any)
    vi.mocked(createStudent).mockResolvedValue({ id: STUDENT_ID } as any)

    await createStudentAction(makeFormData(baseFields))

    expect(createStudent).toHaveBeenCalledWith(
      expect.objectContaining({
        student_code: null,
        allergies: null,
        notes: null,
      }),
    )
  })

  it('uses existing guardian id without calling createGuardian', async () => {
    vi.mocked(createStudent).mockResolvedValue({ id: STUDENT_ID } as any)

    await createStudentAction(
      makeFormData({
        ...baseFields,
        primary_mode: 'existing',
        primary_existing_id: GUARDIAN_EXISTING,
        primary_relationship: 'Father',
      }),
    )

    expect(createGuardian).not.toHaveBeenCalled()
    expect(createStudent).toHaveBeenCalledWith(
      expect.objectContaining({ primary_guardian_id: GUARDIAN_EXISTING }),
    )
  })
})
