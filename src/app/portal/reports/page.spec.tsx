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
  getStaffAttendanceByDateRange: vi.fn(),
  getAttendanceByDateRange: vi.fn(),
  getIncidentCountsByDateRange: vi.fn(),
}))

vi.mock('./_components/ReportsModeSelector', () => ({
  default: vi.fn((props: Record<string, unknown>) => (
    <div data-testid="mode-selector" data-mode={props.mode} />
  )),
}))

vi.mock('./_components/DayReport', () => ({
  default: vi.fn(() => <div data-testid="day-report" />),
}))

vi.mock('./_components/PeriodReport', () => ({
  default: vi.fn(() => <div data-testid="period-report" />),
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
  getStaffAttendanceByDateRange,
  getAttendanceByDateRange,
  getIncidentCountsByDateRange,
} from '@/db'

import ReportsPage from './page'

const defaultSearchParams = Promise.resolve({})

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue({ user: { role: 'admin' } } as any)
  // Day mode defaults
  vi.mocked(getStudentCount).mockResolvedValue(0)
  vi.mocked(getEnrollmentCountsByClass).mockResolvedValue({})
  vi.mocked(getAllClasses).mockResolvedValue([])
  vi.mocked(getAllStaff).mockResolvedValue([])
  vi.mocked(getAttendanceSummaryByDate).mockResolvedValue({})
  vi.mocked(getAttendanceLateCount).mockResolvedValue(0)
  vi.mocked(getStaffSignedInCount).mockResolvedValue(0)
  // Range mode defaults
  vi.mocked(getStaffAttendanceByDateRange).mockResolvedValue([])
  vi.mocked(getAttendanceByDateRange).mockResolvedValue([])
  vi.mocked(getIncidentCountsByDateRange).mockResolvedValue({
    medical: 0,
    behaviour: 0,
    other: 0,
    total: 0,
  })
})

describe('ReportsPage', () => {
  // ── Auth tests ──────────────────────────────────────────────────────────

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

  // ── Mode selector ───────────────────────────────────────────────────────

  it('renders the mode selector', async () => {
    render(await ReportsPage({ searchParams: defaultSearchParams }))
    expect(screen.getByTestId('mode-selector')).toBeTruthy()
  })

  // ── Day mode ────────────────────────────────────────────────────────────

  it('defaults to day mode when no mode param', async () => {
    render(await ReportsPage({ searchParams: defaultSearchParams }))
    expect(screen.getByTestId('day-report')).toBeTruthy()
    expect(screen.queryByTestId('period-report')).toBeNull()
  })

  it('renders DayReport with mode=day', async () => {
    const searchParams = Promise.resolve({ mode: 'day', date: '2024-01-15' })
    render(await ReportsPage({ searchParams }))
    expect(screen.getByTestId('day-report')).toBeTruthy()
  })

  it('calls day-specific DB functions with selected date', async () => {
    const searchParams = Promise.resolve({ mode: 'day', date: '2024-01-15' })
    render(await ReportsPage({ searchParams }))
    expect(getAttendanceSummaryByDate).toHaveBeenCalledWith('2024-01-15')
    expect(getStaffSignedInCount).toHaveBeenCalledWith('2024-01-15')
    expect(getAttendanceLateCount).toHaveBeenCalledWith('2024-01-15')
  })

  // ── Month mode ──────────────────────────────────────────────────────────

  it('renders PeriodReport in month mode', async () => {
    const searchParams = Promise.resolve({ mode: 'month', month: '2024-03' })
    render(await ReportsPage({ searchParams }))
    expect(screen.getByTestId('period-report')).toBeTruthy()
    expect(screen.queryByTestId('day-report')).toBeNull()
  })

  it('calls range DB functions with first/last day of month', async () => {
    const searchParams = Promise.resolve({ mode: 'month', month: '2024-03' })
    render(await ReportsPage({ searchParams }))
    expect(getStaffAttendanceByDateRange).toHaveBeenCalledWith(
      '2024-03-01',
      '2024-03-31',
    )
    expect(getAttendanceByDateRange).toHaveBeenCalledWith(
      '2024-03-01',
      '2024-03-31',
    )
    expect(getIncidentCountsByDateRange).toHaveBeenCalledWith(
      '2024-03-01',
      '2024-03-31',
    )
  })

  // ── Range mode ──────────────────────────────────────────────────────────

  it('renders PeriodReport in range mode', async () => {
    const searchParams = Promise.resolve({
      mode: 'range',
      from: '2024-03-01',
      to: '2024-03-15',
    })
    render(await ReportsPage({ searchParams }))
    expect(screen.getByTestId('period-report')).toBeTruthy()
    expect(screen.queryByTestId('day-report')).toBeNull()
  })

  it('calls range DB functions with from/to params', async () => {
    const searchParams = Promise.resolve({
      mode: 'range',
      from: '2024-03-01',
      to: '2024-03-15',
    })
    render(await ReportsPage({ searchParams }))
    expect(getStaffAttendanceByDateRange).toHaveBeenCalledWith(
      '2024-03-01',
      '2024-03-15',
    )
    expect(getAttendanceByDateRange).toHaveBeenCalledWith(
      '2024-03-01',
      '2024-03-15',
    )
  })

  // ── Mode selector receives correct props ────────────────────────────────

  it('passes mode=day to selector by default', async () => {
    render(await ReportsPage({ searchParams: defaultSearchParams }))
    const selector = screen.getByTestId('mode-selector')
    expect(selector.getAttribute('data-mode')).toBe('day')
  })

  it('passes mode=month to selector', async () => {
    const searchParams = Promise.resolve({ mode: 'month', month: '2024-03' })
    render(await ReportsPage({ searchParams }))
    const selector = screen.getByTestId('mode-selector')
    expect(selector.getAttribute('data-mode')).toBe('month')
  })
})
