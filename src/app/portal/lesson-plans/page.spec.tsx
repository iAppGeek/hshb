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
  getLessonPlans: vi.fn(),
  getClassesByTeacher: vi.fn(),
}))

vi.mock('./LessonPlansClient', () => ({
  default: ({
    lessonPlans,
    canCreate,
    canEdit,
  }: {
    lessonPlans: unknown[]
    canCreate: boolean
    canEdit: boolean
  }) => (
    <div>
      LessonPlansClient count={lessonPlans.length} canCreate=
      {String(canCreate)} canEdit={String(canEdit)}
    </div>
  ),
}))

import { auth } from '@/auth'
import { getLessonPlans, getClassesByTeacher } from '@/db'

import LessonPlansPage from './page'

beforeEach(() => {
  vi.clearAllMocks()
})

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

describe('LessonPlansPage', () => {
  it('redirects to /portal/login when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    await expect(LessonPlansPage()).rejects.toThrow(
      'NEXT_REDIRECT:/portal/login',
    )
  })

  it('renders LessonPlansClient for admin with canCreate=true and canEdit=true', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getLessonPlans).mockResolvedValue([mockPlan] as any)

    render(await LessonPlansPage())
    expect(screen.getByText(/canCreate=true/)).toBeTruthy()
    expect(screen.getByText(/canEdit=true/)).toBeTruthy()
  })

  it('renders LessonPlansClient for headteacher with canCreate=true and canEdit=true', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'headteacher', staffId: 'staff-2' },
    } as any)
    vi.mocked(getLessonPlans).mockResolvedValue([])

    render(await LessonPlansPage())
    expect(screen.getByText(/canCreate=true/)).toBeTruthy()
    expect(screen.getByText(/canEdit=true/)).toBeTruthy()
  })

  it('renders LessonPlansClient for teacher with canCreate=true and canEdit=true', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-3' },
    } as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue([{ id: 'class-1' }] as any)
    vi.mocked(getLessonPlans).mockResolvedValue([mockPlan] as any)

    render(await LessonPlansPage())
    expect(screen.getByText(/canCreate=true/)).toBeTruthy()
    expect(screen.getByText(/canEdit=true/)).toBeTruthy()
  })

  it('scopes lesson plans to teacher classes only', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-3' },
    } as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue([{ id: 'class-1' }] as any)
    vi.mocked(getLessonPlans).mockResolvedValue([])

    await LessonPlansPage()
    expect(getClassesByTeacher).toHaveBeenCalledWith('staff-3')
    expect(getLessonPlans).toHaveBeenCalledWith({
      classIds: ['class-1'],
      limit: 50,
    })
  })

  it('fetches all lesson plans for admin without scoping', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getLessonPlans).mockResolvedValue([])

    await LessonPlansPage()
    expect(getLessonPlans).toHaveBeenCalledWith({ limit: 50 })
    expect(getClassesByTeacher).not.toHaveBeenCalled()
  })

  it('renders LessonPlansClient for secretary with canCreate=false and canEdit=false', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'secretary', staffId: 'staff-4' },
    } as any)
    vi.mocked(getLessonPlans).mockResolvedValue([mockPlan] as any)

    render(await LessonPlansPage())
    expect(screen.getByText(/canCreate=false/)).toBeTruthy()
    expect(screen.getByText(/canEdit=false/)).toBeTruthy()
  })

  it('fetches all lesson plans for secretary without scoping', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'secretary', staffId: 'staff-4' },
    } as any)
    vi.mocked(getLessonPlans).mockResolvedValue([])

    await LessonPlansPage()
    expect(getLessonPlans).toHaveBeenCalledWith({ limit: 50 })
    expect(getClassesByTeacher).not.toHaveBeenCalled()
  })
})
