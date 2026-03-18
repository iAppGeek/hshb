import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('./client', () => ({
  supabase: { from: mockFrom },
}))

import {
  getIncidentCount,
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
} from './incidents'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockIncident = {
  id: 'inc-1',
  type: 'medical' as const,
  student_id: 'student-1',
  title: 'Allergic reaction',
  description: 'Student showed signs of allergic reaction',
  incident_date: '2026-03-14T10:00:00Z',
  created_by: 'staff-1',
  updated_by: null,
  created_at: '2026-03-14T10:00:00Z',
  updated_at: '2026-03-14T10:00:00Z',
  student: { id: 'student-1', first_name: 'Nikos', last_name: 'Papadopoulos' },
  creator: { id: 'staff-1', first_name: 'Alice', last_name: 'Smith' },
  updater: null,
}

describe('getIncidentCount', () => {
  it('returns the total number of incidents', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ count: 7, error: null }),
    })

    const result = await getIncidentCount()
    expect(result).toBe(7)
    expect(mockFrom).toHaveBeenCalledWith('incidents')
  })

  it('returns 0 when count is null', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ count: null, error: null }),
    })

    const result = await getIncidentCount()
    expect(result).toBe(0)
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      select: vi
        .fn()
        .mockResolvedValue({ count: null, error: { message: 'DB error' } }),
    })

    await expect(getIncidentCount()).rejects.toEqual({ message: 'DB error' })
  })
})

describe('getIncidents', () => {
  it('returns all incidents when no options provided', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockIncident], error: null }),
      }),
    })

    const result = await getIncidents()
    expect(result).toEqual([mockIncident])
    expect(mockFrom).toHaveBeenCalledWith('incidents')
  })

  it('filters by studentIds when provided', async () => {
    const inFn = vi
      .fn()
      .mockResolvedValue({ data: [mockIncident], error: null })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          in: inFn,
        }),
      }),
    })

    await getIncidents({ studentIds: ['student-1'] })
    expect(inFn).toHaveBeenCalledWith('student_id', ['student-1'])
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      }),
    })

    await expect(getIncidents()).rejects.toEqual({ message: 'DB error' })
  })
})

describe('getIncidentById', () => {
  it('returns the incident when found', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi
            .fn()
            .mockResolvedValue({ data: mockIncident, error: null }),
        }),
      }),
    })

    const result = await getIncidentById('inc-1')
    expect(result).toEqual(mockIncident)
  })

  it('returns null when not found (PGRST116)', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi
            .fn()
            .mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        }),
      }),
    })

    const result = await getIncidentById('missing-id')
    expect(result).toBeNull()
  })

  it('throws on unexpected database error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: '500', message: 'Server error' },
          }),
        }),
      }),
    })

    await expect(getIncidentById('inc-1')).rejects.toEqual({
      code: '500',
      message: 'Server error',
    })
  })
})

describe('createIncident', () => {
  it('inserts a new incident and returns it', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi
            .fn()
            .mockResolvedValue({ data: mockIncident, error: null }),
        }),
      }),
    })

    const result = await createIncident({
      type: 'medical',
      student_id: 'student-1',
      title: 'Allergic reaction',
      description: 'Student showed signs of allergic reaction',
      incident_date: '2026-03-14T10:00:00Z',
      created_by: 'staff-1',
    })

    expect(result).toEqual(mockIncident)
    expect(mockFrom).toHaveBeenCalledWith('incidents')
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Insert failed' },
          }),
        }),
      }),
    })

    await expect(
      createIncident({
        type: 'medical',
        student_id: 'student-1',
        title: 'Test',
        description: 'Test',
        incident_date: '2026-03-14T10:00:00Z',
        created_by: 'staff-1',
      }),
    ).rejects.toEqual({ message: 'Insert failed' })
  })
})

describe('updateIncident', () => {
  it('updates an incident and returns it', async () => {
    const updated = {
      ...mockIncident,
      title: 'Updated title',
      updated_by: 'staff-2',
    }
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: updated, error: null }),
          }),
        }),
      }),
    })

    const result = await updateIncident('inc-1', {
      title: 'Updated title',
      updated_by: 'staff-2',
    })

    expect(result).toEqual(updated)
    expect(mockFrom).toHaveBeenCalledWith('incidents')
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Update failed' },
            }),
          }),
        }),
      }),
    })

    await expect(
      updateIncident('inc-1', { updated_by: 'staff-2' }),
    ).rejects.toEqual({ message: 'Update failed' })
  })
})
