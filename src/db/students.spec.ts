import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('./client', () => ({
  supabase: { from: mockFrom },
}))

import { getAllStudents, getStudentsByClass, getStudentById } from './students'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockStudent = {
  id: 'student-1',
  student_code: 'STU-001',
  first_name: 'Nikos',
  last_name: 'Papadopoulos',
  active: true,
  class_id: 'class-1',
  class: { id: 'class-1', name: 'Year 3', year_group: '3' },
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
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [mockStudent] }),
          }),
        }),
      }),
    })

    const result = await getStudentsByClass('class-1')
    expect(result).toEqual([mockStudent])
  })

  it('returns empty array when class has no students', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
      }),
    })

    const result = await getStudentsByClass('empty-class')
    expect(result).toEqual([])
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
