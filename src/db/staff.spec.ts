import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidateTag } from 'next/cache'

import {
  getStaffByEmail,
  getStaffById,
  getAllStaff,
  getAllStaffWithClasses,
  getTeachers,
  createStaff,
  updateStaff,
} from './staff'

beforeEach(() => {
  vi.clearAllMocks()
})
const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
  revalidateTag: vi.fn(),
}))

vi.mock('./client', () => ({
  supabase: { from: mockFrom },
}))

describe('getStaffByEmail', () => {
  it('returns staff when email matches', async () => {
    const mockStaff = {
      id: 'staff-1',
      email: 'teacher@school.com',
      first_name: 'Jane',
      last_name: 'Smith',
      display_name: null,
      role: 'teacher',
    }
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
      {
        id: 'staff-1',
        first_name: 'Alice',
        last_name: 'Papadopoulos',
        display_name: null,
        role: 'teacher',
      },
      {
        id: 'staff-2',
        first_name: 'Bob',
        last_name: 'Jones',
        display_name: 'Mr Jones',
        role: 'admin',
      },
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
        classes: [
          {
            id: 'class-1',
            name: 'Year 3A',
            room_number: 'R12',
            year_group: '3',
          },
        ],
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

describe('getStaffById', () => {
  it('returns the staff member when found', async () => {
    const mockStaff = {
      id: 'staff-1',
      first_name: 'Alice',
      last_name: 'Smith',
      email: 'alice@school.com',
      role: 'teacher',
      display_name: null,
      contact_number: null,
    }
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockStaff }),
        }),
      }),
    })

    const result = await getStaffById('staff-1')
    expect(result).toEqual(mockStaff)
    expect(mockFrom).toHaveBeenCalledWith('staff')
  })

  it('returns null when not found', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    })

    const result = await getStaffById('nonexistent')
    expect(result).toBeNull()
  })
})

describe('createStaff', () => {
  it('inserts a staff record and returns it', async () => {
    const input = {
      first_name: 'Alice',
      last_name: 'Smith',
      email: 'alice@school.com',
      role: 'teacher',
      display_name: null,
      contact_number: null,
      personal_email: null,
    }
    const created = { id: 'staff-new', ...input }
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: created, error: null }),
        }),
      }),
    })

    const result = await createStaff(input)
    expect(result).toEqual(created)
    expect(mockFrom).toHaveBeenCalledWith('staff')
    expect(revalidateTag).toHaveBeenCalledWith('staff', 'max')
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
      createStaff({
        first_name: 'Alice',
        last_name: 'Smith',
        email: 'alice@school.com',
        role: 'teacher',
      }),
    ).rejects.toThrow('DB error')
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})

describe('updateStaff', () => {
  it('calls update with the correct data', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({ eq: mockEq }),
    })

    await updateStaff('staff-1', {
      first_name: 'Alice',
      last_name: 'Smith',
      email: 'alice@school.com',
      role: 'admin',
    })

    expect(mockFrom).toHaveBeenCalledWith('staff')
    expect(mockEq).toHaveBeenCalledWith('id', 'staff-1')
    expect(revalidateTag).toHaveBeenCalledWith('staff', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('classes', 'max')
  })

  it('throws when supabase returns an error', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: new Error('DB error') }),
      }),
    })

    await expect(
      updateStaff('staff-1', {
        first_name: 'Alice',
        last_name: 'Smith',
        email: 'alice@school.com',
        role: 'teacher',
      }),
    ).rejects.toThrow('DB error')
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})

describe('getTeachers', () => {
  it('returns staff with teacher or headteacher role', async () => {
    const mockData = [
      {
        id: 'staff-1',
        first_name: 'Jane',
        last_name: 'Smith',
        display_name: null,
      },
      {
        id: 'staff-2',
        first_name: 'Bob',
        last_name: 'Jones',
        display_name: 'Mr Jones',
      },
    ]
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockData }),
        }),
      }),
    })

    const result = await getTeachers()
    expect(result).toEqual(mockData)
    expect(mockFrom).toHaveBeenCalledWith('staff')
  })

  it('returns empty array when no teachers exist', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        in: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    })

    const result = await getTeachers()
    expect(result).toEqual([])
  })
})
