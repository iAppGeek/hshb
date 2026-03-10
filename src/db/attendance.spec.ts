import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('./client', () => ({
  supabase: { from: mockFrom },
}))

import {
  getAttendanceByClassAndDate,
  getAttendanceLastUpdatedPerClass,
  saveAttendance,
} from './attendance'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockRow = {
  id: 'att-1',
  class_id: 'class-1',
  student_id: 'student-1',
  date: '2024-03-08',
  status: 'present',
  notes: null,
  recorded_by: 'staff-1',
  created_at: '2024-03-08T10:00:00Z',
  updated_at: '2024-03-08T10:00:00Z',
}

describe('getAttendanceByClassAndDate', () => {
  it('returns attendance rows for the given class and date', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [mockRow], error: null }),
        }),
      }),
    })

    const result = await getAttendanceByClassAndDate('class-1', '2024-03-08')
    expect(result).toEqual([mockRow])
    expect(mockFrom).toHaveBeenCalledWith('attendance')
  })

  it('returns empty array when no records exist', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    })

    const result = await getAttendanceByClassAndDate('class-1', '2024-03-08')
    expect(result).toEqual([])
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'DB error' } }),
        }),
      }),
    })

    await expect(
      getAttendanceByClassAndDate('class-1', '2024-03-08'),
    ).rejects.toEqual({
      message: 'DB error',
    })
  })
})

describe('getAttendanceLastUpdatedPerClass', () => {
  it('returns map of class_id to latest updated_at for the given date', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            { class_id: 'class-1', updated_at: '2024-03-08T09:00:00Z' },
            { class_id: 'class-1', updated_at: '2024-03-08T10:30:00Z' },
            { class_id: 'class-2', updated_at: '2024-03-08T08:00:00Z' },
          ],
          error: null,
        }),
      }),
    })

    const result = await getAttendanceLastUpdatedPerClass('2024-03-08')
    expect(result).toEqual({
      'class-1': '2024-03-08T10:30:00Z',
      'class-2': '2024-03-08T08:00:00Z',
    })
  })

  it('returns empty object when no attendance records exist', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    })

    const result = await getAttendanceLastUpdatedPerClass('2024-03-08')
    expect(result).toEqual({})
  })
})

describe('saveAttendance', () => {
  it('upserts attendance records and returns saved rows', async () => {
    mockFrom.mockReturnValue({
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: [mockRow], error: null }),
      }),
    })

    const records = [
      {
        class_id: 'class-1',
        student_id: 'student-1',
        date: '2024-03-08',
        status: 'present' as const,
        recorded_by: 'staff-1',
      },
    ]

    const result = await saveAttendance(records)
    expect(result).toEqual([mockRow])
    expect(mockFrom).toHaveBeenCalledWith('attendance')
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      upsert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Upsert failed' },
        }),
      }),
    })

    await expect(saveAttendance([])).rejects.toEqual({
      message: 'Upsert failed',
    })
  })
})
