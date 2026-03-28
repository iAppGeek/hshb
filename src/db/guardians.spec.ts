import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidateTag } from 'next/cache'

import {
  getGuardianCount,
  getAllGuardians,
  createGuardian,
  getGuardianById,
  getStudentsByGuardian,
  updateGuardian,
} from './guardians'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

vi.mock('./client', () => ({
  supabase: { from: mockFrom },
}))

describe('getGuardianCount', () => {
  it('returns the total number of guardians', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ count: 12, error: null }),
    })

    const result = await getGuardianCount()
    expect(result).toBe(12)
    expect(mockFrom).toHaveBeenCalledWith('guardians')
  })

  it('returns 0 when count is null', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ count: null, error: null }),
    })

    const result = await getGuardianCount()
    expect(result).toBe(0)
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      select: vi
        .fn()
        .mockResolvedValue({ count: null, error: { message: 'DB error' } }),
    })

    await expect(getGuardianCount()).rejects.toEqual({ message: 'DB error' })
  })
})

describe('getAllGuardians', () => {
  it('returns guardians ordered by last name', async () => {
    const mockGuardians = [
      {
        id: 'g-1',
        first_name: 'Maria',
        last_name: 'Smith',
        phone: '07700 900000',
      },
    ]
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockGuardians }),
      }),
    })

    const result = await getAllGuardians()
    expect(result).toEqual(mockGuardians)
    expect(mockFrom).toHaveBeenCalledWith('guardians')
  })

  it('returns empty array when no guardians exist', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null }),
      }),
    })

    const result = await getAllGuardians()
    expect(result).toEqual([])
  })
})

describe('createGuardian', () => {
  it('inserts a guardian and returns the id', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'guardian-1' },
            error: null,
          }),
        }),
      }),
    })

    const result = await createGuardian({
      first_name: 'Maria',
      last_name: 'Papadopoulos',
      phone: '07700 900000',
      email: 'maria@example.com',
    })

    expect(result).toEqual({ id: 'guardian-1' })
    expect(mockFrom).toHaveBeenCalledWith('guardians')
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
      createGuardian({ first_name: 'A', last_name: 'B', phone: '07700' }),
    ).rejects.toThrow('DB error')
  })
})

describe('getGuardianById', () => {
  it('returns a guardian by id', async () => {
    const mockGuardian = {
      id: 'guardian-1',
      first_name: 'Maria',
      last_name: 'Smith',
      phone: '07700 900000',
      email: 'maria@example.com',
      address_line_1: null,
      address_line_2: null,
      city: null,
      postcode: null,
      notes: null,
    }
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockGuardian }),
        }),
      }),
    })

    const result = await getGuardianById('guardian-1')
    expect(result).toEqual(mockGuardian)
    expect(mockFrom).toHaveBeenCalledWith('guardians')
  })

  it('returns null when guardian not found', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    })

    const result = await getGuardianById('missing-id')
    expect(result).toBeNull()
  })
})

describe('getStudentsByGuardian', () => {
  it('returns students linked to the guardian', async () => {
    const mockStudents = [
      {
        id: 'student-1',
        first_name: 'Anna',
        last_name: 'Smith',
        student_code: 'S001',
      },
    ]
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        or: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockStudents }),
          }),
        }),
      }),
    })

    const result = await getStudentsByGuardian('guardian-1')
    expect(result).toEqual(mockStudents)
    expect(mockFrom).toHaveBeenCalledWith('students')
  })

  it('returns empty array when no students are linked', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        or: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
      }),
    })

    const result = await getStudentsByGuardian('guardian-1')
    expect(result).toEqual([])
  })
})

describe('updateGuardian', () => {
  it('updates a guardian successfully', async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
    mockFrom.mockReturnValue({ update: mockUpdate })

    await updateGuardian('guardian-1', {
      first_name: 'Maria',
      last_name: 'Smith',
      phone: '07700 900000',
    })

    expect(mockFrom).toHaveBeenCalledWith('guardians')
    expect(mockUpdate).toHaveBeenCalled()
    expect(revalidateTag).toHaveBeenCalledWith('students', 'max')
  })

  it('throws when the database returns an error', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: new Error('DB error') }),
      }),
    })

    await expect(
      updateGuardian('guardian-1', {
        first_name: 'A',
        last_name: 'B',
        phone: '07700',
      }),
    ).rejects.toThrow('DB error')
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})
