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
  getAllStaff: vi.fn(),
  getIncidentCount: vi.fn(),
  getGuardianCount: vi.fn(),
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
  UserGroupIcon: () => <svg />,
  CalendarDaysIcon: () => <svg />,
  ChartBarIcon: () => <svg />,
  ExclamationTriangleIcon: () => <svg />,
}))

import { auth } from '@/auth'
import {
  getStudentCount,
  getStudentsByTeacher,
  getAllClasses,
  getClassesByTeacher,
  getAllStaff,
  getIncidentCount,
  getGuardianCount,
} from '@/db'

import DashboardPage from './page'

beforeEach(() => {
  vi.clearAllMocks()
})

function mockAdmin() {
  vi.mocked(auth).mockResolvedValue({
    user: { name: 'Admin User', role: 'admin', staffId: 'staff-1' },
  } as any)
  vi.mocked(getStudentCount).mockResolvedValue(0)
  vi.mocked(getAllClasses).mockResolvedValue([])
  vi.mocked(getAllStaff).mockResolvedValue([])
  vi.mocked(getIncidentCount).mockResolvedValue(0)
  vi.mocked(getGuardianCount).mockResolvedValue(0)
}

function mockTeacher() {
  vi.mocked(auth).mockResolvedValue({
    user: { name: 'Teacher User', role: 'teacher', staffId: 'staff-2' },
  } as any)
  vi.mocked(getStudentsByTeacher).mockResolvedValue([])
  vi.mocked(getClassesByTeacher).mockResolvedValue([])
}

describe('DashboardPage', () => {
  it('renders welcome message with user first name', async () => {
    mockAdmin()
    render(await DashboardPage())
    expect(screen.getByText(/welcome back, admin/i)).toBeTruthy()
  })

  it('shows admin role label for admin user', async () => {
    mockAdmin()
    render(await DashboardPage())
    expect(screen.getByText('Admin')).toBeTruthy()
  })

  it('shows all admin cards', async () => {
    mockAdmin()
    render(await DashboardPage())
    expect(screen.getByText('Total Students')).toBeTruthy()
    expect(screen.getByText('Total Classes')).toBeTruthy()
    expect(screen.getByText('Total Staff')).toBeTruthy()
    expect(screen.getByText('Total Guardians')).toBeTruthy()
    expect(screen.getByText('Total Incidents')).toBeTruthy()
    expect(screen.getByText('Reports')).toBeTruthy()
  })

  it('shows correct counts for admin cards', async () => {
    mockAdmin()
    vi.mocked(getStudentCount).mockResolvedValue(42)
    vi.mocked(getAllStaff).mockResolvedValue([
      { id: 's-1' },
      { id: 's-2' },
    ] as any)
    vi.mocked(getIncidentCount).mockResolvedValue(5)
    vi.mocked(getGuardianCount).mockResolvedValue(18)

    render(await DashboardPage())
    expect(screen.getByText('42')).toBeTruthy()
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy()
    expect(screen.getByText('18')).toBeTruthy()
  })

  it('does not show admin cards for teacher', async () => {
    mockTeacher()
    render(await DashboardPage())
    expect(screen.queryByText('Total Staff')).toBeNull()
    expect(screen.queryByText('Total Guardians')).toBeNull()
    expect(screen.queryByText('Total Incidents')).toBeNull()
    expect(screen.queryByText('Reports')).toBeNull()
  })

  it('shows My Students and My Classes labels for teacher', async () => {
    mockTeacher()
    render(await DashboardPage())
    expect(screen.getByText('My Students')).toBeTruthy()
    expect(screen.getByText('My Classes')).toBeTruthy()
  })

  it('calls getClassesByTeacher for teacher role', async () => {
    mockTeacher()
    await DashboardPage()
    expect(getClassesByTeacher).toHaveBeenCalledWith('staff-2')
    expect(getAllClasses).not.toHaveBeenCalled()
  })

  it('calls getStudentsByTeacher for teacher role student count', async () => {
    mockTeacher()
    vi.mocked(getStudentsByTeacher).mockResolvedValue([
      { id: 'student-1' },
    ] as any)
    await DashboardPage()
    expect(getStudentsByTeacher).toHaveBeenCalledWith('staff-2')
    expect(getStudentCount).not.toHaveBeenCalled()
  })

  it('calls getStudentCount for admin role', async () => {
    mockAdmin()
    vi.mocked(getStudentCount).mockResolvedValue(42)
    await DashboardPage()
    expect(getStudentCount).toHaveBeenCalled()
    expect(getStudentsByTeacher).not.toHaveBeenCalled()
  })

  it('classes card links to /portal/classes', async () => {
    mockAdmin()
    render(await DashboardPage())
    const link = screen.getByText('Total Classes').closest('a')
    expect(link?.getAttribute('href')).toBe('/portal/classes')
  })

  it('staff card links to /portal/staff', async () => {
    mockAdmin()
    render(await DashboardPage())
    const link = screen.getByText('Total Staff').closest('a')
    expect(link?.getAttribute('href')).toBe('/portal/staff')
  })
})
