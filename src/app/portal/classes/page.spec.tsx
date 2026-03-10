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
  getAllClassesIncludingInactive: vi.fn(),
  getClassesByTeacher: vi.fn(),
}))

vi.mock('./ClassesTable', () => ({
  default: ({ classes }: { classes: { id: string; name: string }[] }) => (
    <div data-testid="classes-table">
      {classes.map((c) => (
        <span key={c.id}>{c.name}</span>
      ))}
    </div>
  ),
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

import { auth } from '@/auth'
import { getAllClassesIncludingInactive, getClassesByTeacher } from '@/db'

import ClassesPage from './page'

const mockClasses = [
  {
    id: 'class-1',
    name: 'Year 1A',
    year_group: '1',
    room_number: 'R1',
    academic_year: '2024/25',
    active: true,
    teacher: { first_name: 'Jane', last_name: 'Smith' },
  },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ClassesPage', () => {
  it('redirects to login when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    await expect(ClassesPage()).rejects.toThrow('NEXT_REDIRECT:/portal/login')
  })

  it('renders heading for admin', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllClassesIncludingInactive).mockResolvedValue(
      mockClasses as any,
    )

    render(await ClassesPage())
    expect(screen.getByText('Classes')).toBeTruthy()
  })

  it('shows Add Class button for admin', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllClassesIncludingInactive).mockResolvedValue(
      mockClasses as any,
    )

    render(await ClassesPage())
    expect(screen.getByRole('link', { name: 'Add Class' })).toBeTruthy()
  })

  it('shows Add Class button for headteacher', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'headteacher', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllClassesIncludingInactive).mockResolvedValue(
      mockClasses as any,
    )

    render(await ClassesPage())
    expect(screen.getByRole('link', { name: 'Add Class' })).toBeTruthy()
  })

  it('does not show Add Class button for teacher', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-1' },
    } as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue(mockClasses as any)

    render(await ClassesPage())
    expect(screen.queryByRole('link', { name: 'Add Class' })).toBeNull()
  })

  it('fetches own classes for teacher role', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-99' },
    } as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue(mockClasses as any)

    render(await ClassesPage())
    expect(getClassesByTeacher).toHaveBeenCalledWith('staff-99')
    expect(getAllClassesIncludingInactive).not.toHaveBeenCalled()
  })

  it('shows empty state when no classes', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllClassesIncludingInactive).mockResolvedValue([])

    render(await ClassesPage())
    expect(screen.getByText('No classes found.')).toBeTruthy()
  })

  it('renders the ClassesTable with class data', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllClassesIncludingInactive).mockResolvedValue(
      mockClasses as any,
    )

    render(await ClassesPage())
    expect(screen.getByTestId('classes-table')).toBeTruthy()
    expect(screen.getByText('Year 1A')).toBeTruthy()
  })
})
