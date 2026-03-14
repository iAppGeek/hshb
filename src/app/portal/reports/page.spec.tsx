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
  getStudentCount: vi.fn(),
  getStudentsWithAllergiesCount: vi.fn(),
  getEnrollmentCountsByClass: vi.fn(),
  getAllClasses: vi.fn(),
  getAllStaff: vi.fn(),
  getAttendanceSummaryByDate: vi.fn(),
}))

import { auth } from '@/auth'
import {
  getStudentCount,
  getStudentsWithAllergiesCount,
  getEnrollmentCountsByClass,
  getAllClasses,
  getAllStaff,
  getAttendanceSummaryByDate,
} from '@/db'

import ReportsPage from './page'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue({ user: { role: 'admin' } } as any)
  vi.mocked(getStudentCount).mockResolvedValue(0)
  vi.mocked(getStudentsWithAllergiesCount).mockResolvedValue(0)
  vi.mocked(getEnrollmentCountsByClass).mockResolvedValue({})
  vi.mocked(getAllClasses).mockResolvedValue([])
  vi.mocked(getAllStaff).mockResolvedValue([])
  vi.mocked(getAttendanceSummaryByDate).mockResolvedValue({})
})

describe('ReportsPage', () => {
  it('redirects to dashboard when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    await expect(ReportsPage()).rejects.toThrow(
      'NEXT_REDIRECT:/portal/dashboard',
    )
  })

  it('redirects to dashboard when role is teacher', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'teacher' } } as any)

    await expect(ReportsPage()).rejects.toThrow(
      'NEXT_REDIRECT:/portal/dashboard',
    )
  })

  it('renders the Reports & Analytics heading', async () => {
    render(await ReportsPage())
    expect(screen.getByText('Reports & Analytics')).toBeTruthy()
  })

  it('displays correct total active student count', async () => {
    vi.mocked(getStudentCount).mockResolvedValue(5)

    render(await ReportsPage())
    expect(screen.getByText('5')).toBeTruthy()
  })

  it('counts students with allergies correctly', async () => {
    vi.mocked(getStudentsWithAllergiesCount).mockResolvedValue(1)

    render(await ReportsPage())
    expect(screen.getByText('Students with allergies')).toBeTruthy()
  })

  it('renders enrolment by class table', async () => {
    vi.mocked(getAllClasses).mockResolvedValue([
      { id: 'class-1', name: 'Year 3A', year_group: '3' },
    ] as any)
    vi.mocked(getEnrollmentCountsByClass).mockResolvedValue({ 'class-1': 2 })

    render(await ReportsPage())
    expect(screen.getByText('Year 3A')).toBeTruthy()
    expect(screen.getByText('Todays Attendance')).toBeTruthy()
  })

  it('counts only teaching staff in the teachers stat', async () => {
    vi.mocked(getAllStaff).mockResolvedValue([
      { id: 'staff-1', role: 'teacher' },
      { id: 'staff-2', role: 'admin' },
      { id: 'staff-3', role: 'teacher' },
    ] as any)

    render(await ReportsPage())
    expect(screen.getByText('Teaching staff')).toBeTruthy()
  })

  it('shows Not Completed when no attendance for a class today', async () => {
    vi.mocked(getAllClasses).mockResolvedValue([
      { id: 'class-1', name: 'Year 3A', year_group: '3' },
    ] as any)
    vi.mocked(getAttendanceSummaryByDate).mockResolvedValue({})

    render(await ReportsPage())
    expect(screen.getAllByText('Not Completed')).toHaveLength(1)
  })

  it('shows created and updated times when attendance exists for a class today', async () => {
    vi.mocked(getAllClasses).mockResolvedValue([
      { id: 'class-1', name: 'Year 3A', year_group: '3' },
    ] as any)
    vi.mocked(getAttendanceSummaryByDate).mockResolvedValue({
      'class-1': {
        createdAt: '2024-03-08T09:00:00Z',
        updatedAt: '2024-03-08T09:30:00Z',
        presentCount: 3,
      },
    } as any)

    render(await ReportsPage())
    expect(screen.queryAllByText('Not Completed')).toHaveLength(0)
  })
})
