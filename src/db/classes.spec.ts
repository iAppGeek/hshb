import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('./client', () => ({
  supabase: { from: mockFrom },
}))

import {
  getAllClasses,
  getAllClassesIncludingInactive,
  getClassById,
  getClassesByTeacher,
  createClass,
  updateClass,
  setClassStudents,
} from './classes'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockClass = {
  id: 'class-1',
  name: 'Year 3A',
  year_group: '3',
  room_number: 'R12',
  teacher_id: 'staff-1',
  active: true,
  teacher: {
    id: 'staff-1',
    first_name: 'Jane',
    last_name: 'Smith',
    display_name: null,
    email: 'jane@school.com',
  },
}

describe('getAllClasses', () => {
  it('returns active classes ordered by year group', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [mockClass] }),
        }),
      }),
    })

    const result = await getAllClasses()
    expect(result).toEqual([mockClass])
    expect(mockFrom).toHaveBeenCalledWith('classes')
  })

  it('returns empty array when no classes exist', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    })

    const result = await getAllClasses()
    expect(result).toEqual([])
  })
})

describe('getClassesByTeacher', () => {
  it('returns active classes assigned to the given teacher', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [mockClass] }),
          }),
        }),
      }),
    })

    const result = await getClassesByTeacher('staff-1')
    expect(result).toEqual([mockClass])
  })

  it('returns empty array when teacher has no classes', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
      }),
    })

    const result = await getClassesByTeacher('staff-99')
    expect(result).toEqual([])
  })
})

describe('getAllClassesIncludingInactive', () => {
  it('returns all classes without active filter', async () => {
    const mockData = [
      { ...mockClass, active: true },
      { ...mockClass, id: 'class-2', active: false },
    ]
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockData }),
      }),
    })

    const result = await getAllClassesIncludingInactive()
    expect(result).toEqual(mockData)
    expect(mockFrom).toHaveBeenCalledWith('classes')
  })

  it('returns empty array when no classes exist', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null }),
      }),
    })

    const result = await getAllClassesIncludingInactive()
    expect(result).toEqual([])
  })
})

describe('getClassById', () => {
  it('returns a class with student enrollments', async () => {
    const mockData = {
      ...mockClass,
      student_classes: [{ student_id: 'student-1' }],
    }
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockData }),
        }),
      }),
    })

    const result = await getClassById('class-1')
    expect(result).toEqual(mockData)
    expect(mockFrom).toHaveBeenCalledWith('classes')
  })

  it('returns null when class not found', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    })

    const result = await getClassById('nonexistent')
    expect(result).toBeNull()
  })
})

describe('createClass', () => {
  it('inserts a class record and returns it', async () => {
    const input = {
      name: 'Year 1A',
      year_group: '1',
      room_number: 'R1',
      academic_year: '2024/25',
      teacher_id: 'staff-1',
    }
    const created = { id: 'class-new', ...input, active: true }
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: created, error: null }),
        }),
      }),
    })

    const result = await createClass(input)
    expect(result).toEqual(created)
    expect(mockFrom).toHaveBeenCalledWith('classes')
  })

  it('throws when supabase returns an error', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi
            .fn()
            .mockResolvedValue({ data: null, error: new Error('DB error') }),
        }),
      }),
    })

    await expect(
      createClass({ name: 'X', year_group: '1', teacher_id: 'staff-1' }),
    ).rejects.toThrow('DB error')
  })
})

describe('updateClass', () => {
  it('calls update with the correct data', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({ eq: mockEq }),
    })

    await updateClass('class-1', { name: 'Year 1B', active: false })
    expect(mockFrom).toHaveBeenCalledWith('classes')
    expect(mockEq).toHaveBeenCalledWith('id', 'class-1')
  })

  it('throws when supabase returns an error', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: new Error('DB error') }),
      }),
    })

    await expect(updateClass('class-1', { name: 'X' })).rejects.toThrow(
      'DB error',
    )
  })
})

describe('setClassStudents', () => {
  it('deletes existing enrollments then inserts new ones', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null })
    const mockDeleteEq = vi.fn().mockResolvedValue({ error: null })
    mockFrom
      .mockReturnValueOnce({
        delete: vi.fn().mockReturnValue({ eq: mockDeleteEq }),
      })
      .mockReturnValueOnce({ insert: mockInsert })

    await setClassStudents('class-1', ['student-1', 'student-2'])

    expect(mockDeleteEq).toHaveBeenCalledWith('class_id', 'class-1')
    expect(mockInsert).toHaveBeenCalledWith([
      { class_id: 'class-1', student_id: 'student-1' },
      { class_id: 'class-1', student_id: 'student-2' },
    ])
  })

  it('skips insert when studentIds is empty', async () => {
    const mockDeleteEq = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq: mockDeleteEq }),
    })

    await setClassStudents('class-1', [])
    expect(mockFrom).toHaveBeenCalledTimes(1)
  })

  it('throws when delete fails', async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: new Error('delete error') }),
      }),
    })

    await expect(setClassStudents('class-1', ['s-1'])).rejects.toThrow(
      'delete error',
    )
  })
})
