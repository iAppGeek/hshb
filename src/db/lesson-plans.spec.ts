import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('./client', () => ({
  supabase: { from: mockFrom },
}))

import {
  getLessonPlanCount,
  getLessonPlans,
  getLessonPlanById,
  createLessonPlan,
  updateLessonPlan,
} from './lesson-plans'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockPlan = {
  id: 'plan-1',
  class_id: 'class-1',
  lesson_date: '2026-03-21',
  description: 'Phonics lesson on blends',
  created_by: 'staff-1',
  updated_by: null,
  created_at: '2026-03-21T08:00:00Z',
  updated_at: '2026-03-21T08:00:00Z',
  class: { id: 'class-1', name: 'Year 1A', year_group: 'Year 1' },
  creator: { id: 'staff-1', first_name: 'Alice', last_name: 'Smith' },
  updater: null,
}

describe('getLessonPlanCount', () => {
  it('returns the total number of lesson plans', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ count: 5, error: null }),
    })

    const result = await getLessonPlanCount()
    expect(result).toBe(5)
    expect(mockFrom).toHaveBeenCalledWith('lesson_plans')
  })

  it('returns 0 when count is null', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ count: null, error: null }),
    })

    const result = await getLessonPlanCount()
    expect(result).toBe(0)
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      select: vi
        .fn()
        .mockResolvedValue({ count: null, error: { message: 'DB error' } }),
    })

    await expect(getLessonPlanCount()).rejects.toEqual({ message: 'DB error' })
  })
})

describe('getLessonPlans', () => {
  it('returns all lesson plans when no options provided', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockPlan], error: null }),
      }),
    })

    const result = await getLessonPlans()
    expect(result).toEqual([mockPlan])
    expect(mockFrom).toHaveBeenCalledWith('lesson_plans')
  })

  it('filters by classIds when provided', async () => {
    const inFn = vi.fn().mockResolvedValue({ data: [mockPlan], error: null })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          in: inFn,
        }),
      }),
    })

    await getLessonPlans({ classIds: ['class-1'] })
    expect(inFn).toHaveBeenCalledWith('class_id', ['class-1'])
  })

  it('throws on database error', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      }),
    })

    await expect(getLessonPlans()).rejects.toEqual({ message: 'DB error' })
  })
})

describe('getLessonPlanById', () => {
  it('returns the lesson plan when found', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockPlan, error: null }),
        }),
      }),
    })

    const result = await getLessonPlanById('plan-1')
    expect(result).toEqual(mockPlan)
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

    const result = await getLessonPlanById('missing-id')
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

    await expect(getLessonPlanById('plan-1')).rejects.toEqual({
      code: '500',
      message: 'Server error',
    })
  })
})

describe('createLessonPlan', () => {
  it('inserts a new lesson plan and returns it', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockPlan, error: null }),
        }),
      }),
    })

    const result = await createLessonPlan({
      class_id: 'class-1',
      lesson_date: '2026-03-21',
      description: 'Phonics lesson on blends',
      created_by: 'staff-1',
    })

    expect(result).toEqual(mockPlan)
    expect(mockFrom).toHaveBeenCalledWith('lesson_plans')
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
      createLessonPlan({
        class_id: 'class-1',
        lesson_date: '2026-03-21',
        description: 'Test',
        created_by: 'staff-1',
      }),
    ).rejects.toEqual({ message: 'Insert failed' })
  })
})

describe('updateLessonPlan', () => {
  it('updates a lesson plan and returns it', async () => {
    const updated = {
      ...mockPlan,
      description: 'Updated description',
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

    const result = await updateLessonPlan('plan-1', {
      description: 'Updated description',
      updated_by: 'staff-2',
    })

    expect(result).toEqual(updated)
    expect(mockFrom).toHaveBeenCalledWith('lesson_plans')
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
      updateLessonPlan('plan-1', { updated_by: 'staff-2' }),
    ).rejects.toEqual({ message: 'Update failed' })
  })
})
