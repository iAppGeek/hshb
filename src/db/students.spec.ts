import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidateTag } from 'next/cache'

import {
  getAllStudents,
  getStudentsForList,
  searchStudents,
  getStudentsByTeacher,
  getStudentIdsByTeacher,
  getStudentCount,
  getStudentsWithAllergiesCount,
  getStudentsByClass,
  getStudentById,
  createStudent,
  enrollStudentInClasses,
  updateStudent,
  updateStudentClasses,
} from './students'
const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
  revalidateTag: vi.fn(),
}))

vi.mock('./client', () => ({
  supabase: { from: mockFrom },
}))

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

describe('getStudentsForList', () => {
  it('returns lightweight active students ordered by last name', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'student-1',
                first_name: 'Nikos',
                last_name: 'Papadopoulos',
                student_code: 'STU-001',
              },
            ],
          }),
        }),
      }),
    })

    const result = await getStudentsForList()
    expect(result).toHaveLength(1)
    expect(mockFrom).toHaveBeenCalledWith('students')
  })

  it('returns empty array when no students', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    })

    const result = await getStudentsForList()
    expect(result).toEqual([])
  })
})

describe('searchStudents', () => {
  it('returns matching students limited to 20', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          or: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [
                  {
                    id: 'student-1',
                    first_name: 'Nikos',
                    last_name: 'Papadopoulos',
                    student_code: 'STU-001',
                  },
                ],
              }),
            }),
          }),
        }),
      }),
    })

    const result = await searchStudents('Nikos')
    expect(result).toHaveLength(1)
    expect(mockFrom).toHaveBeenCalledWith('students')
  })

  it('returns empty array for empty query', async () => {
    const result = await searchStudents('   ')
    expect(result).toEqual([])
    expect(mockFrom).not.toHaveBeenCalled()
  })
})

describe('getStudentsByTeacher', () => {
  it('returns students in the teacher classes', async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [{ id: 'class-1' }] }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi
            .fn()
            .mockResolvedValue({ data: [{ student_id: 'student-1' }] }),
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

    const result = await getStudentsByTeacher('teacher-1')
    expect(result).toEqual([mockStudent])
    expect(mockFrom).toHaveBeenNthCalledWith(1, 'classes')
    expect(mockFrom).toHaveBeenNthCalledWith(2, 'student_classes')
    expect(mockFrom).toHaveBeenNthCalledWith(3, 'students')
  })

  it('returns empty array when teacher has no classes', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [] }),
        }),
      }),
    })

    const result = await getStudentsByTeacher('teacher-no-classes')
    expect(result).toEqual([])
    expect(mockFrom).toHaveBeenCalledTimes(1)
  })
})

describe('getStudentIdsByTeacher', () => {
  it('returns unique student IDs for a teacher', async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ id: 'class-1' }, { id: 'class-2' }],
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({
            data: [
              { student_id: 'student-1' },
              { student_id: 'student-1' },
              { student_id: 'student-2' },
            ],
          }),
        }),
      })

    const result = await getStudentIdsByTeacher('teacher-1')
    expect(result).toEqual(['student-1', 'student-2'])
  })

  it('returns empty array when teacher has no classes', async () => {
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [] }),
        }),
      }),
    })

    const result = await getStudentIdsByTeacher('teacher-no-classes')
    expect(result).toEqual([])
  })
})

describe('getStudentCount', () => {
  it('returns count of active students', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: 42 }),
      }),
    })

    const result = await getStudentCount()
    expect(result).toBe(42)
    expect(mockFrom).toHaveBeenCalledWith('students')
  })

  it('returns 0 when count is null', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ count: null }),
      }),
    })

    const result = await getStudentCount()
    expect(result).toBe(0)
  })
})

describe('getStudentsWithAllergiesCount', () => {
  it('returns count of active students with allergies', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          not: vi.fn().mockReturnValue({
            neq: vi.fn().mockResolvedValue({ count: 7 }),
          }),
        }),
      }),
    })

    const result = await getStudentsWithAllergiesCount()
    expect(result).toBe(7)
    expect(mockFrom).toHaveBeenCalledWith('students')
  })
})

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
    expect(revalidateTag).toHaveBeenCalledWith('students', 'max')
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
    expect(revalidateTag).not.toHaveBeenCalled()
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
    expect(revalidateTag).toHaveBeenCalledWith('students', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('classes', 'max')
  })

  it('does nothing when classIds is empty', async () => {
    await enrollStudentInClasses('student-1', [])
    expect(mockFrom).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('throws when the database returns an error', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: new Error('DB error') }),
    })

    await expect(
      enrollStudentInClasses('student-1', ['class-1']),
    ).rejects.toThrow('DB error')
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})

describe('updateStudent', () => {
  it('updates a student successfully', async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
    mockFrom.mockReturnValue({ update: mockUpdate })

    await updateStudent('student-1', { first_name: 'Updated' })

    expect(mockFrom).toHaveBeenCalledWith('students')
    expect(mockUpdate).toHaveBeenCalledWith({ first_name: 'Updated' })
    expect(revalidateTag).toHaveBeenCalledWith('students', 'max')
  })

  it('throws when the database returns an error', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: new Error('DB error') }),
      }),
    })

    await expect(
      updateStudent('student-1', { first_name: 'X' }),
    ).rejects.toThrow('DB error')
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})

describe('updateStudentClasses', () => {
  it('deletes existing classes and re-inserts new ones', async () => {
    const mockDelete = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    mockFrom
      .mockReturnValueOnce({ delete: mockDelete })
      .mockReturnValueOnce({ insert: mockInsert })

    await updateStudentClasses('student-1', ['class-1', 'class-2'])

    expect(mockFrom).toHaveBeenNthCalledWith(1, 'student_classes')
    expect(mockDelete).toHaveBeenCalled()
    expect(mockInsert).toHaveBeenCalledWith([
      { student_id: 'student-1', class_id: 'class-1' },
      { student_id: 'student-1', class_id: 'class-2' },
    ])
    expect(revalidateTag).toHaveBeenCalledWith('students', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('classes', 'max')
  })

  it('deletes existing classes and skips insert when classIds is empty', async () => {
    const mockDelete = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
    mockFrom.mockReturnValueOnce({ delete: mockDelete })

    await updateStudentClasses('student-1', [])

    expect(mockFrom).toHaveBeenCalledTimes(1)
    expect(mockDelete).toHaveBeenCalled()
    expect(revalidateTag).toHaveBeenCalledWith('students', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('classes', 'max')
  })

  it('throws when the delete fails', async () => {
    mockFrom.mockReturnValueOnce({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: new Error('Delete error') }),
      }),
    })

    await expect(
      updateStudentClasses('student-1', ['class-1']),
    ).rejects.toThrow('Delete error')
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})
