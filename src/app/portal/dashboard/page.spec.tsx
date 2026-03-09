import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/db', () => ({
  getAllStudents: vi.fn(),
  getAllClasses: vi.fn(),
  getClassesByTeacher: vi.fn(),
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

vi.mock('@heroicons/react/24/outline', () => ({
  UsersIcon: () => <svg />,
  CalendarDaysIcon: () => <svg />,
  ChartBarIcon: () => <svg />,
}))

import { auth } from '@/auth'
import { getAllStudents, getAllClasses, getClassesByTeacher } from '@/db'

import DashboardPage from './page'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DashboardPage', () => {
  it('renders welcome message with user first name', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { name: 'Jane Smith', role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllStudents).mockResolvedValue([])
    vi.mocked(getAllClasses).mockResolvedValue([])

    render(await DashboardPage())
    expect(screen.getByText(/welcome back, jane/i)).toBeTruthy()
  })

  it('shows admin role label for admin user', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { name: 'Admin User', role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllStudents).mockResolvedValue([])
    vi.mocked(getAllClasses).mockResolvedValue([])

    render(await DashboardPage())
    expect(screen.getByText('Admin')).toBeTruthy()
  })

  it('shows reports stat card for admin', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { name: 'Admin', role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllStudents).mockResolvedValue([])
    vi.mocked(getAllClasses).mockResolvedValue([])

    render(await DashboardPage())
    expect(screen.getByText('Reports')).toBeTruthy()
  })

  it('does not show reports stat card for teacher', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { name: 'Teacher', role: 'teacher', staffId: 'staff-2' },
    } as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue([])
    vi.mocked(getAllStudents).mockResolvedValue([])

    render(await DashboardPage())
    expect(screen.queryByText('Reports')).toBeNull()
  })

  it('calls getClassesByTeacher for teacher role', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { name: 'Teacher', role: 'teacher', staffId: 'staff-2' },
    } as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue([])
    vi.mocked(getAllStudents).mockResolvedValue([])

    await DashboardPage()
    expect(getClassesByTeacher).toHaveBeenCalledWith('staff-2')
    expect(getAllClasses).not.toHaveBeenCalled()
  })
})
