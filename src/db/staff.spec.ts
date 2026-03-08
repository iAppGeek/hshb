import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('./client', () => ({
  supabase: { from: mockFrom },
}))

import { getStaffByEmail, getAllStaff, getAllStaffWithClasses } from './staff'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getStaffByEmail', () => {
  it('returns staff when email matches', async () => {
    const mockStaff = { id: 'staff-1', email: 'teacher@school.com', first_name: 'Jane', last_name: 'Smith', display_name: null, role: 'teacher' }
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockStaff }),
        }),
      }),
    })

    const result = await getStaffByEmail('teacher@school.com')
    expect(result).toEqual(mockStaff)
    expect(mockFrom).toHaveBeenCalledWith('staff')
  })

  it('returns null when email is not found', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    })

    const result = await getStaffByEmail('unknown@gmail.com')
    expect(result).toBeNull()
  })

  it('lowercases the email before querying', async () => {
    const mockEq = vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: null }),
    })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: mockEq }),
    })

    await getStaffByEmail('TEACHER@SCHOOL.COM')
    expect(mockEq).toHaveBeenCalledWith('email', 'teacher@school.com')
  })
})

describe('getAllStaff', () => {
  it('returns all staff ordered by name', async () => {
    const mockStaff = [
      { id: 'staff-1', first_name: 'Alice', last_name: 'Papadopoulos', display_name: null, role: 'teacher' },
      { id: 'staff-2', first_name: 'Bob', last_name: 'Jones', display_name: 'Mr Jones', role: 'admin' },
    ]
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockStaff }),
      }),
    })

    const result = await getAllStaff()
    expect(result).toEqual(mockStaff)
  })

  it('returns empty array when no staff exist', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null }),
      }),
    })

    const result = await getAllStaff()
    expect(result).toEqual([])
  })
})

describe('getAllStaffWithClasses', () => {
  it('returns staff with their associated classes', async () => {
    const mockData = [
      {
        id: 'staff-1',
        first_name: 'Jane',
        last_name: 'Smith',
        display_name: null,
        role: 'teacher',
        classes: [{ id: 'class-1', name: 'Year 3A', room_number: 'R12', year_group: '3' }],
      },
    ]
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockData }),
      }),
    })

    const result = await getAllStaffWithClasses()
    expect(result).toEqual(mockData)
    expect(mockFrom).toHaveBeenCalledWith('staff')
  })

  it('returns empty array when no staff exist', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null }),
      }),
    })

    const result = await getAllStaffWithClasses()
    expect(result).toEqual([])
  })
})
