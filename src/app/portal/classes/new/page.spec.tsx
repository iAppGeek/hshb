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
  getTeachers: vi.fn(),
  getStudentsForList: vi.fn(),
}))

vi.mock('../ClassForm', () => ({
  default: ({ submitLabel }: { submitLabel: string }) => (
    <div data-testid="class-form">{submitLabel}</div>
  ),
}))

vi.mock('./actions', () => ({
  createClassAction: vi.fn(),
}))

import { auth } from '@/auth'
import { getTeachers, getStudentsForList } from '@/db'

import AddClassPage from './page'

const mockTeachers = [
  { id: 'staff-1', first_name: 'Jane', last_name: 'Smith', display_name: null },
]
const mockStudents = [
  { id: 'student-1', first_name: 'Alice', last_name: 'Brown' },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AddClassPage', () => {
  it('redirects teacher to /portal/classes', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-1' },
    } as any)

    await expect(AddClassPage()).rejects.toThrow(
      'NEXT_REDIRECT:/portal/classes',
    )
  })

  it('renders heading for admin', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getTeachers).mockResolvedValue(mockTeachers as any)
    vi.mocked(getStudentsForList).mockResolvedValue(mockStudents as any)

    render(await AddClassPage())
    expect(screen.getByRole('heading', { name: 'Add Class' })).toBeTruthy()
  })

  it('renders heading for headteacher', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'headteacher', staffId: 'staff-1' },
    } as any)
    vi.mocked(getTeachers).mockResolvedValue(mockTeachers as any)
    vi.mocked(getStudentsForList).mockResolvedValue(mockStudents as any)

    render(await AddClassPage())
    expect(screen.getByRole('heading', { name: 'Add Class' })).toBeTruthy()
  })

  it('renders ClassForm for admin', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getTeachers).mockResolvedValue(mockTeachers as any)
    vi.mocked(getStudentsForList).mockResolvedValue(mockStudents as any)

    render(await AddClassPage())
    expect(screen.getByTestId('class-form')).toBeTruthy()
  })

  it('fetches teachers and students', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getTeachers).mockResolvedValue(mockTeachers as any)
    vi.mocked(getStudentsForList).mockResolvedValue(mockStudents as any)

    render(await AddClassPage())
    expect(getTeachers).toHaveBeenCalled()
    expect(getStudentsForList).toHaveBeenCalled()
  })
})
