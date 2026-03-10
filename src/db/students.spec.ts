import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('./client', () => ({
  supabase: { from: mockFrom },
}))

import {
  getAllStudents,
  getStudentsByClass,
  getStudentById,
  createStudent,
  enrollStudentInClasses,
} from './students'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockStudent = {
  id: 'student-1',
  student_code: 'STU-001',
  first_name: 'Nikos',
  last_name: 'Papadopoulos',
  active: true,
  student_classes: [
    { class: { id: 'class-1', name: 'Year 3', year_group: '3' } },
  ],
  primary_guardian: {
    first_name: 'Maria',
    last_name: 'Papadopoulos',
    phone: '07700 900000',
    email: 'maria@example.com',
    address_line_1: '1 Main Street',
    address_line_2: null,
    city: 'London',
    postcode: 'EC1A 1BB',
    notes: null,
  },
  primary_guardian_relationship: 'Mother',
  secondary_guardian: null,
  secondary_guardian_relationship: null,
  additional_contact_1: null,
  additional_contact_1_relationship: null,
  additional_contact_2: null,
  additional_contact_2_relationship: null,
}

describe('getAllStudents', () => {
  it('returns active students ordered by last name', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [mockStudent] }),
        }),
      }),
    })

    const result = await getAllStudents()
    expect(result).toEqual([mockStudent])
    expect(mockFrom).toHaveBeenCalledWith('students')
  })

  it('returns empty array when no students exist', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    })

    const result = await getAllStudents()
    expect(result).toEqual([])
  })
})

describe('getStudentsByClass', () => {
  it('returns students for the given class', async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ student_id: 'student-1' }],
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [mockStudent] }),
            }),
          }),
        }),
      })

    const result = await getStudentsByClass('class-1')
    expect(result).toEqual([mockStudent])
    expect(mockFrom).toHaveBeenNthCalledWith(1, 'student_classes')
    expect(mockFrom).toHaveBeenNthCalledWith(2, 'students')
  })

  it('returns empty array when class has no students', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null }),
      }),
    })

    const result = await getStudentsByClass('empty-class')
    expect(result).toEqual([])
    expect(mockFrom).toHaveBeenCalledTimes(1)
  })
})

describe('getStudentById', () => {
  it('returns a single student by id', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockStudent }),
        }),
      }),
    })

    const result = await getStudentById('student-1')
    expect(result).toEqual(mockStudent)
  })

  it('returns null when student is not found', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    })

    const result = await getStudentById('missing-id')
    expect(result).toBeNull()
  })
})

describe('createStudent', () => {
  it('inserts a student and returns the id', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'student-new' },
            error: null,
          }),
        }),
      }),
    })

    const result = await createStudent({
      first_name: 'Anna',
      last_name: 'Smith',
      primary_guardian_id: 'guardian-1',
      address_line_1: '1 Main Street',
      city: 'London',
      postcode: 'EC1A 1BB',
    })

    expect(result).toEqual({ id: 'student-new' })
    expect(mockFrom).toHaveBeenCalledWith('students')
  })

  it('throws when the database returns an error', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('DB error'),
          }),
        }),
      }),
    })

    await expect(
      createStudent({
        first_name: 'A',
        last_name: 'B',
        primary_guardian_id: 'g-1',
        address_line_1: '1 Street',
        city: 'London',
        postcode: 'E1 1AA',
      }),
    ).rejects.toThrow('DB error')
  })
})

describe('enrollStudentInClasses', () => {
  it('inserts rows into student_classes for each class id', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ insert: mockInsert })

    await enrollStudentInClasses('student-1', ['class-1', 'class-2'])

    expect(mockFrom).toHaveBeenCalledWith('student_classes')
    expect(mockInsert).toHaveBeenCalledWith([
      { student_id: 'student-1', class_id: 'class-1' },
      { student_id: 'student-1', class_id: 'class-2' },
    ])
  })

  it('does nothing when classIds is empty', async () => {
    await enrollStudentInClasses('student-1', [])
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('throws when the database returns an error', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: new Error('DB error') }),
    })

    await expect(
      enrollStudentInClasses('student-1', ['class-1']),
    ).rejects.toThrow('DB error')
  })
})
