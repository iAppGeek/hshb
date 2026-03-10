import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('./client', () => ({
  supabase: { from: mockFrom },
}))

import { getAllClasses, getClassesByTeacher } from './classes'

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
