import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createGuardian, createStudent, enrollStudentInClasses } from '@/db'

import { createStudentAction } from './actions'

vi.mock('@/db', () => ({
  createGuardian: vi.fn(),
  createStudent: vi.fn(),
  enrollStudentInClasses: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function makeFormData(fields: Record<string, string>) {
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
  student_address_line_1: '',
  student_address_line_2: '',
  student_city: '',
  student_postcode: '',
  student_allergies: '',
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
    vi.mocked(createGuardian).mockResolvedValue({ id: 'guardian-1' } as any)
    vi.mocked(createStudent).mockResolvedValue({ id: 'student-1' } as any)
    vi.mocked(enrollStudentInClasses).mockResolvedValue(undefined)

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
        primary_guardian_id: 'guardian-1',
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
      .mockResolvedValueOnce({ id: 'guardian-1' } as any)
      .mockResolvedValueOnce({ id: 'guardian-2' } as any)
    vi.mocked(createStudent).mockResolvedValue({ id: 'student-1' } as any)
    vi.mocked(enrollStudentInClasses).mockResolvedValue(undefined)

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
      expect.objectContaining({ secondary_guardian_id: 'guardian-2' }),
    )
  })

  it('creates additional contact 1 when has_contact1 is true', async () => {
    vi.mocked(createGuardian)
      .mockResolvedValueOnce({ id: 'guardian-1' } as any)
      .mockResolvedValueOnce({ id: 'contact-1' } as any)
    vi.mocked(createStudent).mockResolvedValue({ id: 'student-1' } as any)
    vi.mocked(enrollStudentInClasses).mockResolvedValue(undefined)

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
      expect.objectContaining({ additional_contact_1_id: 'contact-1' }),
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
    vi.mocked(createGuardian).mockResolvedValue({ id: 'guardian-1' } as any)
    vi.mocked(createStudent).mockResolvedValue({ id: 'student-1' } as any)
    vi.mocked(enrollStudentInClasses).mockResolvedValue(undefined)

    await createStudentAction(makeFormData(baseFields))

    expect(createStudent).toHaveBeenCalledWith(
      expect.objectContaining({
        student_code: null,
        allergies: null,
        notes: null,
      }),
    )
  })

  it('enrolls student in selected classes', async () => {
    vi.mocked(createGuardian).mockResolvedValue({ id: 'guardian-1' } as any)
    vi.mocked(createStudent).mockResolvedValue({ id: 'student-1' } as any)
    vi.mocked(enrollStudentInClasses).mockResolvedValue(undefined)

    const fd = makeFormData(baseFields)
    fd.append('student_class_ids', 'class-1')
    fd.append('student_class_ids', 'class-2')

    await createStudentAction(fd)

    expect(enrollStudentInClasses).toHaveBeenCalledWith('student-1', [
      'class-1',
      'class-2',
    ])
  })

  it('uses existing guardian id without calling createGuardian', async () => {
    vi.mocked(createStudent).mockResolvedValue({ id: 'student-1' } as any)
    vi.mocked(enrollStudentInClasses).mockResolvedValue(undefined)

    await createStudentAction(
      makeFormData({
        ...baseFields,
        primary_mode: 'existing',
        primary_existing_id: 'guardian-existing',
        primary_relationship: 'Father',
      }),
    )

    expect(createGuardian).not.toHaveBeenCalled()
    expect(createStudent).toHaveBeenCalledWith(
      expect.objectContaining({ primary_guardian_id: 'guardian-existing' }),
    )
  })

  it('uses existing id for secondary when mode is existing', async () => {
    vi.mocked(createGuardian).mockResolvedValue({ id: 'guardian-1' } as any)
    vi.mocked(createStudent).mockResolvedValue({ id: 'student-1' } as any)
    vi.mocked(enrollStudentInClasses).mockResolvedValue(undefined)

    await createStudentAction(
      makeFormData({
        ...baseFields,
        has_secondary: 'true',
        secondary_mode: 'existing',
        secondary_existing_id: 'guardian-sec',
        secondary_relationship: 'Aunt',
      }),
    )

    expect(createGuardian).toHaveBeenCalledTimes(1) // only primary
    expect(createStudent).toHaveBeenCalledWith(
      expect.objectContaining({ secondary_guardian_id: 'guardian-sec' }),
    )
  })
})
