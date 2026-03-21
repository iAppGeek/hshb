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
  getEnrollmentCountsByClass: vi.fn(),
  getAllClasses: vi.fn(),
  getAllStaff: vi.fn(),
  getAttendanceSummaryByDate: vi.fn(),
  getAttendanceLateCount: vi.fn(),
  getStaffSignedInCount: vi.fn(),
}))

vi.mock('@/components/DatePicker', () => ({
  default: vi.fn(() => <div data-testid="date-picker" />),
}))

import { auth } from '@/auth'
import {
  getStudentCount,
  getEnrollmentCountsByClass,
  getAllClasses,
  getAllStaff,
  getAttendanceSummaryByDate,
  getAttendanceLateCount,
  getStaffSignedInCount,
} from '@/db'

import ReportsPage from './page'

const defaultSearchParams = Promise.resolve({})

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue({ user: { role: 'admin' } } as any)
  vi.mocked(getStudentCount).mockResolvedValue(0)
  vi.mocked(getEnrollmentCountsByClass).mockResolvedValue({})
  vi.mocked(getAllClasses).mockResolvedValue([])
  vi.mocked(getAllStaff).mockResolvedValue([])
  vi.mocked(getAttendanceSummaryByDate).mockResolvedValue({})
  vi.mocked(getAttendanceLateCount).mockResolvedValue(0)
  vi.mocked(getStaffSignedInCount).mockResolvedValue(0)
})

describe('ReportsPage', () => {
  it('redirects to dashboard when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    await expect(
      ReportsPage({ searchParams: defaultSearchParams }),
    ).rejects.toThrow('NEXT_REDIRECT:/portal/dashboard')
  })

  it('redirects to dashboard when role is teacher', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'teacher' } } as any)

    await expect(
      ReportsPage({ searchParams: defaultSearchParams }),
    ).rejects.toThrow('NEXT_REDIRECT:/portal/dashboard')
  })

  it('does not redirect secretary (can access reports)', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'secretary' },
    } as any)

    render(await ReportsPage({ searchParams: defaultSearchParams }))
    expect(screen.getByText('Reports & Analytics')).toBeTruthy()
  })

  it('renders the Reports & Analytics heading', async () => {
    render(await ReportsPage({ searchParams: defaultSearchParams }))
    expect(screen.getByText('Reports & Analytics')).toBeTruthy()
  })

  it('renders the date picker', async () => {
    render(await ReportsPage({ searchParams: defaultSearchParams }))
    expect(screen.getByTestId('date-picker')).toBeTruthy()
  })

  it('displays students attendance as fraction and percentage', async () => {
    vi.mocked(getStudentCount).mockResolvedValue(10)
    vi.mocked(getAttendanceSummaryByDate).mockResolvedValue({
      'class-1': {
        presentCount: 8,
        createdAt: '2024-03-08T09:00:00Z',
        updatedAt: '2024-03-08T09:00:00Z',
      },
    })

    render(await ReportsPage({ searchParams: defaultSearchParams }))
    expect(screen.getByText('8/10')).toBeTruthy()
    expect(screen.getByText('80%')).toBeTruthy()
  })

  it('displays late count summary card', async () => {
    vi.mocked(getAttendanceLateCount).mockResolvedValue(3)

    render(await ReportsPage({ searchParams: defaultSearchParams }))
    expect(screen.getByText('Students late')).toBeTruthy()
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('passes selected date from searchParams to db queries', async () => {
    const searchParams = Promise.resolve({ date: '2024-01-15' })
    render(await ReportsPage({ searchParams }))
    expect(getAttendanceSummaryByDate).toHaveBeenCalledWith('2024-01-15')
    expect(getStaffSignedInCount).toHaveBeenCalledWith('2024-01-15')
    expect(getAttendanceLateCount).toHaveBeenCalledWith('2024-01-15')
  })

  it('renders the Attendance by Class table heading', async () => {
    render(await ReportsPage({ searchParams: defaultSearchParams }))
    expect(screen.getByText('Attendance by Class')).toBeTruthy()
  })

  it('renders class rows in the attendance table', async () => {
    vi.mocked(getAllClasses).mockResolvedValue([
      { id: 'class-1', name: 'Year 3A', year_group: '3' },
    ] as any)
    vi.mocked(getEnrollmentCountsByClass).mockResolvedValue({ 'class-1': 2 })

    render(await ReportsPage({ searchParams: defaultSearchParams }))
    expect(screen.getByText('Year 3A')).toBeTruthy()
  })

  it('shows Not Completed when no attendance for a class', async () => {
    vi.mocked(getAllClasses).mockResolvedValue([
      { id: 'class-1', name: 'Year 3A', year_group: '3' },
    ] as any)
    vi.mocked(getAttendanceSummaryByDate).mockResolvedValue({})

    render(await ReportsPage({ searchParams: defaultSearchParams }))
    expect(screen.getAllByText('Not Completed')).toHaveLength(1)
  })

  it('shows record times when attendance exists for a class', async () => {
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

    render(await ReportsPage({ searchParams: defaultSearchParams }))
    expect(screen.queryAllByText('Not Completed')).toHaveLength(0)
  })
})
