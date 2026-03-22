import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('./client', () => ({
  supabase: { from: mockFrom },
}))

import {
  getAttendanceByClassAndDate,
  getAttendanceLastUpdatedPerClass,
  getAttendanceLateCount,
  getAttendanceByDateRange,
  getAttendanceLateCountByDateRange,
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
  it('returns earliest createdAt and latest updatedAt per class', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: [
            {
              class_id: 'class-1',
              created_at: '2024-03-08T09:00:00Z',
              updated_at: '2024-03-08T09:00:00Z',
              status: 'present',
            },
            {
              class_id: 'class-1',
              created_at: '2024-03-08T09:05:00Z',
              updated_at: '2024-03-08T10:30:00Z',
              status: 'late',
            },
            {
              class_id: 'class-2',
              created_at: '2024-03-08T08:00:00Z',
              updated_at: '2024-03-08T08:00:00Z',
              status: 'absent',
            },
          ],
          error: null,
        }),
      }),
    })

    const result = await getAttendanceLastUpdatedPerClass('2024-03-08')
    expect(result).toEqual({
      'class-1': {
        createdAt: '2024-03-08T09:00:00Z',
        updatedAt: '2024-03-08T10:30:00Z',
        presentCount: 2,
      },
      'class-2': {
        createdAt: '2024-03-08T08:00:00Z',
        updatedAt: '2024-03-08T08:00:00Z',
        presentCount: 0,
      },
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

describe('getAttendanceLateCount', () => {
  it('returns the count of late students for a given date', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 4, error: null }),
        }),
      }),
    })

    const result = await getAttendanceLateCount('2024-03-08')
    expect(result).toBe(4)
    expect(mockFrom).toHaveBeenCalledWith('attendance')
  })

  it('returns 0 when count is null', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: null, error: null }),
        }),
      }),
    })

    const result = await getAttendanceLateCount('2024-03-08')
    expect(result).toBe(0)
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi
            .fn()
            .mockResolvedValue({ count: null, error: { message: 'DB error' } }),
        }),
      }),
    })

    await expect(getAttendanceLateCount('2024-03-08')).rejects.toEqual({
      message: 'DB error',
    })
  })
})

// ─── getAttendanceByDateRange ────────────────────────────────────────────────

describe('getAttendanceByDateRange', () => {
  it('returns attendance rows for a date range', async () => {
    const rows = [
      { class_id: 'class-1', date: '2024-03-08', status: 'present' },
      { class_id: 'class-1', date: '2024-03-09', status: 'late' },
    ]
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          lte: vi.fn().mockResolvedValue({ data: rows, error: null }),
        }),
      }),
    })

    const result = await getAttendanceByDateRange('2024-03-08', '2024-03-09')
    expect(result).toEqual(rows)
    expect(mockFrom).toHaveBeenCalledWith('attendance')
  })

  it('returns empty array when data is null', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          lte: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    })

    const result = await getAttendanceByDateRange('2024-03-08', '2024-03-09')
    expect(result).toEqual([])
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          lte: vi
            .fn()
            .mockResolvedValue({ data: null, error: { message: 'DB error' } }),
        }),
      }),
    })

    await expect(
      getAttendanceByDateRange('2024-03-08', '2024-03-09'),
    ).rejects.toEqual({ message: 'DB error' })
  })
})

// ─── getAttendanceLateCountByDateRange ──────────────────────────────────────

describe('getAttendanceLateCountByDateRange', () => {
  it('returns the count of late students in a date range', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          lte: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
          }),
        }),
      }),
    })

    const result = await getAttendanceLateCountByDateRange(
      '2024-03-01',
      '2024-03-31',
    )
    expect(result).toBe(5)
    expect(mockFrom).toHaveBeenCalledWith('attendance')
  })

  it('returns 0 when count is null', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          lte: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: null, error: null }),
          }),
        }),
      }),
    })

    const result = await getAttendanceLateCountByDateRange(
      '2024-03-01',
      '2024-03-31',
    )
    expect(result).toBe(0)
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        gte: vi.fn().mockReturnValue({
          lte: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              count: null,
              error: { message: 'DB error' },
            }),
          }),
        }),
      }),
    })

    await expect(
      getAttendanceLateCountByDateRange('2024-03-01', '2024-03-31'),
    ).rejects.toEqual({ message: 'DB error' })
  })
})

// ─── saveAttendance ─────────────────────────────────────────────────────────

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
