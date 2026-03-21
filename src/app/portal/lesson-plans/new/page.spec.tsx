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
  getAllClasses: vi.fn(),
  getClassesByTeacher: vi.fn(),
}))

vi.mock('./AddLessonPlanForm', () => ({
  default: () => <div>AddLessonPlanForm</div>,
}))

import { auth } from '@/auth'
import { getAllClasses, getClassesByTeacher } from '@/db'

import AddLessonPlanPage from './page'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockClass = {
  id: 'class-1',
  name: 'Year 1A',
  year_group: 'Year 1',
}

describe('AddLessonPlanPage', () => {
  it('redirects to /portal/login when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    await expect(AddLessonPlanPage()).rejects.toThrow(
      'NEXT_REDIRECT:/portal/login',
    )
  })

  it('redirects to /portal/lesson-plans for secretary role', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'secretary', staffId: 'staff-4' },
    } as any)

    await expect(AddLessonPlanPage()).rejects.toThrow(
      'NEXT_REDIRECT:/portal/lesson-plans',
    )
  })

  it('renders AddLessonPlanForm for admin with all classes', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllClasses).mockResolvedValue([mockClass] as any)

    render(await AddLessonPlanPage())
    expect(screen.getByText('AddLessonPlanForm')).toBeTruthy()
    expect(getAllClasses).toHaveBeenCalled()
    expect(getClassesByTeacher).not.toHaveBeenCalled()
  })

  it('scopes classes for teacher role', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-3' },
    } as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue([mockClass] as any)

    render(await AddLessonPlanPage())
    expect(getClassesByTeacher).toHaveBeenCalledWith('staff-3')
    expect(getAllClasses).not.toHaveBeenCalled()
  })

  it('renders AddLessonPlanForm for headteacher with all classes', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'headteacher', staffId: 'staff-2' },
    } as any)
    vi.mocked(getAllClasses).mockResolvedValue([mockClass] as any)

    render(await AddLessonPlanPage())
    expect(screen.getByText('AddLessonPlanForm')).toBeTruthy()
    expect(getAllClasses).toHaveBeenCalled()
  })
})
