import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

vi.mock('@/db', () => ({
  getLessonPlanById: vi.fn(),
  getClassesByTeacher: vi.fn(),
}))

vi.mock('./EditLessonPlanForm', () => ({
  default: ({ plan }: { plan: { description: string } }) => (
    <div>EditLessonPlanForm description={plan.description}</div>
  ),
}))

import { auth } from '@/auth'
import { getLessonPlanById, getClassesByTeacher } from '@/db'

import EditLessonPlanPage from './page'

const mockPlan = {
  id: 'plan-1',
  class_id: 'class-1',
  lesson_date: '2026-03-21',
  description: 'Phonics lesson',
  created_by: 'staff-1',
  updated_by: null,
  created_at: '2026-03-21T08:00:00Z',
  updated_at: '2026-03-21T08:00:00Z',
  class: { id: 'class-1', name: 'Year 1A', year_group: 'Year 1' },
  creator: { id: 'staff-1', first_name: 'Alice', last_name: 'Smith' },
  updater: null,
}

const params = Promise.resolve({ id: 'plan-1' })

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getLessonPlanById).mockResolvedValue(mockPlan as any)
})

describe('EditLessonPlanPage', () => {
  it('redirects to /portal/login when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    await expect(EditLessonPlanPage({ params })).rejects.toThrow(
      'NEXT_REDIRECT:/portal/login',
    )
  })

  it('redirects to /portal/lesson-plans for secretary role', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'secretary', staffId: 'staff-4' },
    } as any)

    await expect(EditLessonPlanPage({ params })).rejects.toThrow(
      'NEXT_REDIRECT:/portal/lesson-plans',
    )
  })

  it('redirects to /portal/lesson-plans when plan not found', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getLessonPlanById).mockResolvedValue(null as any)

    await expect(EditLessonPlanPage({ params })).rejects.toThrow(
      'NEXT_REDIRECT:/portal/lesson-plans',
    )
  })

  it('redirects teacher when plan class does not belong to them', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-3' },
    } as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue([
      { id: 'class-99' },
    ] as any)

    await expect(EditLessonPlanPage({ params })).rejects.toThrow(
      'NEXT_REDIRECT:/portal/lesson-plans',
    )
  })

  it('renders EditLessonPlanForm for admin', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)

    render(await EditLessonPlanPage({ params }))
    expect(screen.getByText('Edit Lesson Plan')).toBeTruthy()
    expect(
      screen.getByText('EditLessonPlanForm description=Phonics lesson'),
    ).toBeTruthy()
  })

  it('renders EditLessonPlanForm for headteacher', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'headteacher', staffId: 'staff-2' },
    } as any)

    render(await EditLessonPlanPage({ params }))
    expect(
      screen.getByText('EditLessonPlanForm description=Phonics lesson'),
    ).toBeTruthy()
  })

  it('renders EditLessonPlanForm for teacher when class belongs to them', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-3' },
    } as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue([{ id: 'class-1' }] as any)

    render(await EditLessonPlanPage({ params }))
    expect(
      screen.getByText('EditLessonPlanForm description=Phonics lesson'),
    ).toBeTruthy()
  })
})
