import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/db', () => ({
  getStudentCount: vi.fn(),
  getStudentsByTeacher: vi.fn(),
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
import {
  getStudentCount,
  getStudentsByTeacher,
  getAllClasses,
  getClassesByTeacher,
} from '@/db'

import DashboardPage from './page'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DashboardPage', () => {
  it('renders welcome message with user first name', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { name: 'Jane Smith', role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getStudentCount).mockResolvedValue(0)
    vi.mocked(getAllClasses).mockResolvedValue([])

    render(await DashboardPage())
    expect(screen.getByText(/welcome back, jane/i)).toBeTruthy()
  })

  it('shows admin role label for admin user', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { name: 'Admin User', role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getStudentCount).mockResolvedValue(0)
    vi.mocked(getAllClasses).mockResolvedValue([])

    render(await DashboardPage())
    expect(screen.getByText('Admin')).toBeTruthy()
  })

  it('shows reports stat card for admin', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { name: 'Admin', role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getStudentCount).mockResolvedValue(0)
    vi.mocked(getAllClasses).mockResolvedValue([])

    render(await DashboardPage())
    expect(screen.getByText('Reports')).toBeTruthy()
  })

  it('does not show reports stat card for teacher', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { name: 'Teacher', role: 'teacher', staffId: 'staff-2' },
    } as any)
    vi.mocked(getStudentsByTeacher).mockResolvedValue([])
    vi.mocked(getClassesByTeacher).mockResolvedValue([])

    render(await DashboardPage())
    expect(screen.queryByText('Reports')).toBeNull()
  })

  it('calls getClassesByTeacher for teacher role', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { name: 'Teacher', role: 'teacher', staffId: 'staff-2' },
    } as any)
    vi.mocked(getStudentsByTeacher).mockResolvedValue([])
    vi.mocked(getClassesByTeacher).mockResolvedValue([])

    await DashboardPage()
    expect(getClassesByTeacher).toHaveBeenCalledWith('staff-2')
    expect(getAllClasses).not.toHaveBeenCalled()
  })

  it('calls getStudentsByTeacher for teacher role student count', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { name: 'Teacher', role: 'teacher', staffId: 'staff-2' },
    } as any)
    vi.mocked(getStudentsByTeacher).mockResolvedValue([
      { id: 'student-1' },
    ] as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue([])

    await DashboardPage()
    expect(getStudentsByTeacher).toHaveBeenCalledWith('staff-2')
    expect(getStudentCount).not.toHaveBeenCalled()
  })

  it('calls getStudentCount for admin role', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { name: 'Admin', role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getStudentCount).mockResolvedValue(42)
    vi.mocked(getAllClasses).mockResolvedValue([])

    await DashboardPage()
    expect(getStudentCount).toHaveBeenCalled()
    expect(getStudentsByTeacher).not.toHaveBeenCalled()
  })
})
