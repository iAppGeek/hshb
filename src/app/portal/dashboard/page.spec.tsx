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
  getTeachers: vi.fn(),
  getIncidentCount: vi.fn(),
  getLessonPlanCountByDate: vi.fn(),
  getAttendanceSummaryByDate: vi.fn(),
  getStaffSignedInCount: vi.fn(),
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
  ExclamationTriangleIcon: () => <svg />,
  BookOpenIcon: () => <svg />,
  AcademicCapIcon: () => <svg />,
}))

import { auth } from '@/auth'
import {
  getStudentCount,
  getStudentsByTeacher,
  getAllClasses,
  getClassesByTeacher,
  getTeachers,
  getIncidentCount,
  getLessonPlanCountByDate,
  getAttendanceSummaryByDate,
  getStaffSignedInCount,
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
  vi.mocked(getTeachers).mockResolvedValue([])
  vi.mocked(getIncidentCount).mockResolvedValue(0)
  vi.mocked(getLessonPlanCountByDate).mockResolvedValue(0)
  vi.mocked(getAttendanceSummaryByDate).mockResolvedValue({})
  vi.mocked(getStaffSignedInCount).mockResolvedValue(0)
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

  it('shows all admin tiles', async () => {
    mockAdmin()
    render(await DashboardPage())
    expect(screen.getByText('Total Students')).toBeTruthy()
    expect(screen.getByText('Students attendance today')).toBeTruthy()
    expect(screen.getByText('Total Classes')).toBeTruthy()
    expect(screen.getByText('Attendance submitted today')).toBeTruthy()
    expect(screen.getByText('Total Teachers')).toBeTruthy()
    expect(screen.getByText('Staff signed in today')).toBeTruthy()
    expect(screen.getByText('Total Incidents')).toBeTruthy()
    expect(screen.getByText('Lessons planned today')).toBeTruthy()
  })

  it('shows correct student and incident counts for admin', async () => {
    mockAdmin()
    vi.mocked(getStudentCount).mockResolvedValue(42)
    vi.mocked(getIncidentCount).mockResolvedValue(5)

    render(await DashboardPage())
    expect(screen.getByText('42')).toBeTruthy()
    expect(screen.getByText('5')).toBeTruthy()
  })

  it('shows attendance ratio and percentage for admin', async () => {
    mockAdmin()
    vi.mocked(getStudentCount).mockResolvedValue(100)
    vi.mocked(getAttendanceSummaryByDate).mockResolvedValue({
      'class-1': { presentCount: 20, createdAt: '', updatedAt: '' },
      'class-2': { presentCount: 30, createdAt: '', updatedAt: '' },
    })

    render(await DashboardPage())
    expect(screen.getByText('50/100')).toBeTruthy()
    expect(screen.getByText('50%')).toBeTruthy()
  })

  it('shows registers submitted ratio for admin', async () => {
    mockAdmin()
    vi.mocked(getAllClasses).mockResolvedValue([
      { id: 'c-1' },
      { id: 'c-2' },
      { id: 'c-3' },
    ] as any)
    vi.mocked(getAttendanceSummaryByDate).mockResolvedValue({
      'c-1': { presentCount: 10, createdAt: '', updatedAt: '' },
    })

    render(await DashboardPage())
    expect(screen.getByText('1/3')).toBeTruthy()
    expect(screen.getByText('33%')).toBeTruthy()
  })

  it('shows teacher count and staff signed in for admin', async () => {
    mockAdmin()
    vi.mocked(getTeachers).mockResolvedValue([
      { id: 't-1' },
      { id: 't-2' },
    ] as any)
    vi.mocked(getStaffSignedInCount).mockResolvedValue(1)

    render(await DashboardPage())
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByText('1/2')).toBeTruthy()
  })

  it('does not show admin tiles for teacher', async () => {
    mockTeacher()
    render(await DashboardPage())
    expect(screen.queryByText('Students attendance today')).toBeNull()
    expect(screen.queryByText('Attendance submitted today')).toBeNull()
    expect(screen.queryByText('Total Teachers')).toBeNull()
    expect(screen.queryByText('Staff signed in today')).toBeNull()
    expect(screen.queryByText('Total Incidents')).toBeNull()
    expect(screen.queryByText('Lessons planned today')).toBeNull()
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

  it('teachers card links to /portal/staff', async () => {
    mockAdmin()
    render(await DashboardPage())
    const link = screen.getByText('Total Teachers').closest('a')
    expect(link?.getAttribute('href')).toBe('/portal/staff')
  })

  it('shows all admin tiles for secretary', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { name: 'Secretary User', role: 'secretary', staffId: 'staff-4' },
    } as any)
    vi.mocked(getStudentCount).mockResolvedValue(0)
    vi.mocked(getAllClasses).mockResolvedValue([])
    vi.mocked(getTeachers).mockResolvedValue([])
    vi.mocked(getIncidentCount).mockResolvedValue(0)
    vi.mocked(getLessonPlanCountByDate).mockResolvedValue(0)
    vi.mocked(getAttendanceSummaryByDate).mockResolvedValue({})
    vi.mocked(getStaffSignedInCount).mockResolvedValue(0)

    render(await DashboardPage())
    expect(screen.getByText('Total Students')).toBeTruthy()
    expect(screen.getByText('Total Classes')).toBeTruthy()
    expect(screen.getByText('Total Teachers')).toBeTruthy()
    expect(screen.getByText('Total Incidents')).toBeTruthy()
    expect(screen.getByText('Lessons planned today')).toBeTruthy()
  })
})
