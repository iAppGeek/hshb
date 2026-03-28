import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import {
  createLessonPlan,
  updateLessonPlan,
  getLessonPlanById,
  getClassesByTeacher,
} from '@/db'

import { createLessonPlanAction, updateLessonPlanAction } from './actions'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/db', () => ({
  createLessonPlan: vi.fn(),
  updateLessonPlan: vi.fn(),
  getLessonPlanById: vi.fn(),
  getClassesByTeacher: vi.fn(),
  logAuditEvent: vi.fn(),
}))

const STAFF_ID = '00000000-0000-4000-8000-000000000001'
const CLASS_ID = '00000000-0000-4000-8000-000000000010'
const PLAN_ID = '00000000-0000-4000-8000-000000000020'
const OTHER_CLASS = '00000000-0000-4000-8000-000000000030'

const adminSession = { user: { staffId: STAFF_ID, role: 'admin' } }
const teacherSession = { user: { staffId: STAFF_ID, role: 'teacher' } }
const secretarySession = { user: { staffId: STAFF_ID, role: 'secretary' } }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue(adminSession as any)
})

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value)
  }
  return fd
}

const baseCreateFields: Record<string, string> = {
  class_id: CLASS_ID,
  lesson_date: '2026-03-28',
  description: 'Fractions introduction',
}

const baseUpdateFields: Record<string, string> = {
  lesson_date: '2026-03-28',
  description: 'Fractions introduction — updated',
}

// ─── createLessonPlanAction ─────────────────────────────────────────────────

describe('createLessonPlanAction', () => {
  it('returns error when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const result = await createLessonPlanAction(makeFormData(baseCreateFields))
    expect(result).toEqual({ error: 'Unauthorised' })
    expect(createLessonPlan).not.toHaveBeenCalled()
  })

  it('returns error when not authorised', async () => {
    vi.mocked(auth).mockResolvedValue(secretarySession as any)

    const result = await createLessonPlanAction(makeFormData(baseCreateFields))
    expect(result).toEqual({ error: 'Unauthorised' })
    expect(createLessonPlan).not.toHaveBeenCalled()
  })

  it('returns error when validation fails', async () => {
    const fields = { ...baseCreateFields, description: '' }
    const result = await createLessonPlanAction(makeFormData(fields))

    expect(result).toEqual({ error: expect.any(String) })
    expect(createLessonPlan).not.toHaveBeenCalled()
  })

  it('creates lesson plan and redirects on success', async () => {
    vi.mocked(createLessonPlan).mockResolvedValue({ id: PLAN_ID } as any)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      createLessonPlanAction(makeFormData(baseCreateFields)),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(createLessonPlan).toHaveBeenCalledWith(
      expect.objectContaining({
        class_id: CLASS_ID,
        lesson_date: '2026-03-28',
        description: 'Fractions introduction',
        created_by: STAFF_ID,
      }),
    )
    expect(revalidatePath).toHaveBeenCalledWith('/portal/lesson-plans')
    expect(redirect).toHaveBeenCalledWith('/portal/lesson-plans')
  })

  it('restricts teacher to their own classes', async () => {
    vi.mocked(auth).mockResolvedValue(teacherSession as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue([
      { id: OTHER_CLASS },
    ] as any)

    const result = await createLessonPlanAction(makeFormData(baseCreateFields))

    expect(result).toEqual({
      error: 'You can only create lesson plans for your own class.',
    })
    expect(createLessonPlan).not.toHaveBeenCalled()
  })

  it('allows teacher to create for their own class', async () => {
    vi.mocked(auth).mockResolvedValue(teacherSession as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue([{ id: CLASS_ID }] as any)
    vi.mocked(createLessonPlan).mockResolvedValue({ id: PLAN_ID } as any)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      createLessonPlanAction(makeFormData(baseCreateFields)),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(createLessonPlan).toHaveBeenCalled()
  })

  it('returns friendly error on duplicate lesson plan', async () => {
    vi.mocked(createLessonPlan).mockRejectedValue(
      Object.assign(new Error('unique'), { code: '23505' }),
    )

    const result = await createLessonPlanAction(makeFormData(baseCreateFields))
    expect(result).toEqual({
      error: 'A lesson plan already exists for this class on this date.',
    })
  })

  it('returns generic error when creation fails', async () => {
    vi.mocked(createLessonPlan).mockRejectedValue(new Error('DB error'))

    const result = await createLessonPlanAction(makeFormData(baseCreateFields))
    expect(result).toEqual({
      error: 'Failed to create lesson plan. Please try again.',
    })
    expect(redirect).not.toHaveBeenCalled()
  })
})

// ─── updateLessonPlanAction ─────────────────────────────────────────────────

describe('updateLessonPlanAction', () => {
  it('returns error when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const result = await updateLessonPlanAction(
      PLAN_ID,
      makeFormData(baseUpdateFields),
    )
    expect(result).toEqual({ error: 'Unauthorised' })
    expect(updateLessonPlan).not.toHaveBeenCalled()
  })

  it('returns error when not authorised', async () => {
    vi.mocked(auth).mockResolvedValue(secretarySession as any)

    const result = await updateLessonPlanAction(
      PLAN_ID,
      makeFormData(baseUpdateFields),
    )
    expect(result).toEqual({ error: 'Unauthorised' })
    expect(updateLessonPlan).not.toHaveBeenCalled()
  })

  it('updates lesson plan and redirects on success', async () => {
    vi.mocked(updateLessonPlan).mockResolvedValue(undefined as any)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      updateLessonPlanAction(PLAN_ID, makeFormData(baseUpdateFields)),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(updateLessonPlan).toHaveBeenCalledWith(PLAN_ID, {
      lesson_date: '2026-03-28',
      description: 'Fractions introduction — updated',
      updated_by: STAFF_ID,
    })
    expect(revalidatePath).toHaveBeenCalledWith('/portal/lesson-plans')
    expect(redirect).toHaveBeenCalledWith('/portal/lesson-plans')
  })

  it('restricts teacher to their own classes', async () => {
    vi.mocked(auth).mockResolvedValue(teacherSession as any)
    vi.mocked(getLessonPlanById).mockResolvedValue({
      id: PLAN_ID,
      class_id: CLASS_ID,
    } as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue([
      { id: OTHER_CLASS },
    ] as any)

    const result = await updateLessonPlanAction(
      PLAN_ID,
      makeFormData(baseUpdateFields),
    )

    expect(result).toEqual({
      error: 'You can only edit lesson plans for your own class.',
    })
    expect(updateLessonPlan).not.toHaveBeenCalled()
  })

  it('returns error when lesson plan not found for teacher', async () => {
    vi.mocked(auth).mockResolvedValue(teacherSession as any)
    vi.mocked(getLessonPlanById).mockResolvedValue(null)

    const result = await updateLessonPlanAction(
      PLAN_ID,
      makeFormData(baseUpdateFields),
    )

    expect(result).toEqual({ error: 'Lesson plan not found.' })
    expect(updateLessonPlan).not.toHaveBeenCalled()
  })

  it('returns error when validation fails', async () => {
    const fields = { ...baseUpdateFields, description: '' }
    const result = await updateLessonPlanAction(PLAN_ID, makeFormData(fields))

    expect(result).toEqual({ error: expect.any(String) })
    expect(updateLessonPlan).not.toHaveBeenCalled()
  })

  it('returns friendly error on duplicate lesson plan', async () => {
    vi.mocked(updateLessonPlan).mockRejectedValue(
      Object.assign(new Error('unique'), { code: '23505' }),
    )

    const result = await updateLessonPlanAction(
      PLAN_ID,
      makeFormData(baseUpdateFields),
    )
    expect(result).toEqual({
      error: 'A lesson plan already exists for this class on this date.',
    })
  })

  it('returns generic error when update fails', async () => {
    vi.mocked(updateLessonPlan).mockRejectedValue(new Error('DB error'))

    const result = await updateLessonPlanAction(
      PLAN_ID,
      makeFormData(baseUpdateFields),
    )
    expect(result).toEqual({
      error: 'Failed to update lesson plan. Please try again.',
    })
    expect(redirect).not.toHaveBeenCalled()
  })
})
