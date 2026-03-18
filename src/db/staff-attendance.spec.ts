import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('./client', () => ({
  supabase: { from: mockFrom },
}))

import {
  getStaffAttendanceForToday,
  getStaffAttendanceByDate,
  signInStaff,
  signOutStaff,
  getStaffSignedInCount,
} from './staff-attendance'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockRow = {
  id: 'sa-1',
  staff_id: 'staff-1',
  date: '2026-03-18',
  signed_in_at: '2026-03-18T09:00:00Z',
  signed_out_at: null,
  created_at: '2026-03-18T09:00:00Z',
  updated_at: '2026-03-18T09:00:00Z',
}

// ─── getStaffAttendanceForToday ────────────────────────────────────────────────

describe('getStaffAttendanceForToday', () => {
  it('returns the attendance record when found', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi
              .fn()
              .mockResolvedValue({ data: mockRow, error: null }),
          }),
        }),
      }),
    })

    const result = await getStaffAttendanceForToday('staff-1', '2026-03-18')
    expect(result).toEqual(mockRow)
    expect(mockFrom).toHaveBeenCalledWith('staff_attendance')
  })

  it('returns null when no record exists', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    })

    const result = await getStaffAttendanceForToday('staff-1', '2026-03-18')
    expect(result).toBeNull()
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'DB error' },
            }),
          }),
        }),
      }),
    })

    await expect(
      getStaffAttendanceForToday('staff-1', '2026-03-18'),
    ).rejects.toEqual({ message: 'DB error' })
  })
})

// ─── getStaffAttendanceByDate ──────────────────────────────────────────────────

describe('getStaffAttendanceByDate', () => {
  it('returns all attendance records for a date', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [mockRow], error: null }),
      }),
    })

    const result = await getStaffAttendanceByDate('2026-03-18')
    expect(result).toEqual([mockRow])
    expect(mockFrom).toHaveBeenCalledWith('staff_attendance')
  })

  it('returns empty array when no records exist', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    })

    const result = await getStaffAttendanceByDate('2026-03-18')
    expect(result).toEqual([])
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      }),
    })

    await expect(getStaffAttendanceByDate('2026-03-18')).rejects.toEqual({
      message: 'DB error',
    })
  })
})

// ─── signInStaff ──────────────────────────────────────────────────────────────

describe('signInStaff', () => {
  it('upserts a sign-in record with correct fields', async () => {
    const upsertMock = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ upsert: upsertMock })

    await signInStaff('staff-1', '2026-03-18', '2026-03-18T09:00:00Z')

    expect(mockFrom).toHaveBeenCalledWith('staff_attendance')
    expect(upsertMock).toHaveBeenCalledWith(
      {
        staff_id: 'staff-1',
        date: '2026-03-18',
        signed_in_at: '2026-03-18T09:00:00Z',
        signed_out_at: null,
      },
      { onConflict: 'staff_id,date' },
    )
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      upsert: vi
        .fn()
        .mockResolvedValue({ error: { message: 'Upsert failed' } }),
    })

    await expect(
      signInStaff('staff-1', '2026-03-18', '2026-03-18T09:00:00Z'),
    ).rejects.toEqual({ message: 'Upsert failed' })
  })
})

// ─── signOutStaff ─────────────────────────────────────────────────────────────

describe('signOutStaff', () => {
  it('updates signed_out_at for the correct staff member and date', async () => {
    const eqDateMock = vi.fn().mockResolvedValue({ error: null })
    const eqStaffMock = vi.fn().mockReturnValue({ eq: eqDateMock })
    const updateMock = vi.fn().mockReturnValue({ eq: eqStaffMock })
    mockFrom.mockReturnValue({ update: updateMock })

    await signOutStaff('staff-1', '2026-03-18', '2026-03-18T17:00:00Z')

    expect(mockFrom).toHaveBeenCalledWith('staff_attendance')
    expect(updateMock).toHaveBeenCalledWith({
      signed_out_at: '2026-03-18T17:00:00Z',
    })
    expect(eqStaffMock).toHaveBeenCalledWith('staff_id', 'staff-1')
    expect(eqDateMock).toHaveBeenCalledWith('date', '2026-03-18')
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi
            .fn()
            .mockResolvedValue({ error: { message: 'Update failed' } }),
        }),
      }),
    })

    await expect(
      signOutStaff('staff-1', '2026-03-18', '2026-03-18T17:00:00Z'),
    ).rejects.toEqual({ message: 'Update failed' })
  })
})

// ─── getStaffSignedInCount ────────────────────────────────────────────────────

describe('getStaffSignedInCount', () => {
  it('returns the count of signed-in staff for a date', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          is: vi.fn().mockResolvedValue({ count: 3, error: null }),
        }),
      }),
    })

    const result = await getStaffSignedInCount('2026-03-18')
    expect(result).toBe(3)
    expect(mockFrom).toHaveBeenCalledWith('staff_attendance')
  })

  it('returns 0 when count is null', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          is: vi.fn().mockResolvedValue({ count: null, error: null }),
        }),
      }),
    })

    const result = await getStaffSignedInCount('2026-03-18')
    expect(result).toBe(0)
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          is: vi
            .fn()
            .mockResolvedValue({ count: null, error: { message: 'DB error' } }),
        }),
      }),
    })

    await expect(getStaffSignedInCount('2026-03-18')).rejects.toEqual({
      message: 'DB error',
    })
  })
})
