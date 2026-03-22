import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

import type { IncidentCounts } from '@/db'

import PeriodReport from './PeriodReport'
import type { StaffDaysWorkedRow } from './PeriodReport'

vi.mock('./SchoolDaysCard', () => ({
  default: vi.fn((props: Record<string, unknown>) => (
    <div data-testid="school-days-card" data-days={props.totalSchoolDays} />
  )),
}))

const staffDaysWorked: StaffDaysWorkedRow[] = [
  {
    name: 'Jane Smith',
    role: 'teacher',
    daysWorked: 6,
    dates: [
      '2026-03-04',
      '2026-03-07',
      '2026-03-11',
      '2026-03-14',
      '2026-03-18',
      '2026-03-21',
    ],
  },
  {
    name: 'Ali Hassan',
    role: 'headteacher',
    daysWorked: 7,
    dates: [
      '2026-03-04',
      '2026-03-07',
      '2026-03-11',
      '2026-03-14',
      '2026-03-18',
      '2026-03-21',
      '2026-03-25',
    ],
  },
]

const classSummary = [
  {
    name: 'Year 3A',
    enrolled: 10,
    presentCount: 60,
    absentCount: 12,
    lateCount: 5,
  },
  {
    name: 'Year 4B',
    enrolled: 12,
    presentCount: 72,
    absentCount: 8,
    lateCount: 3,
  },
]

const incidentCounts: IncidentCounts = {
  medical: 2,
  behaviour: 1,
  other: 0,
  total: 3,
}

const defaultProps = {
  staffDaysWorked,
  totalSchoolDays: 8,
  schoolDayDates: [
    { date: '2026-03-04', staffCount: 2, attendanceCount: 3 },
    { date: '2026-03-07', staffCount: 1, attendanceCount: 2 },
    { date: '2026-03-11', staffCount: 2, attendanceCount: 3 },
    { date: '2026-03-14', staffCount: 1, attendanceCount: 2 },
    { date: '2026-03-18', staffCount: 2, attendanceCount: 3 },
    { date: '2026-03-21', staffCount: 1, attendanceCount: 2 },
    { date: '2026-03-25', staffCount: 2, attendanceCount: 3 },
    { date: '2026-03-28', staffCount: 1, attendanceCount: 2 },
  ],
  classSummary,
  incidentCounts,
}

describe('PeriodReport', () => {
  it('renders SchoolDaysCard and Incidents card with tooltip', () => {
    render(<PeriodReport {...defaultProps} />)
    expect(screen.getByTestId('school-days-card')).toBeTruthy()
    expect(screen.getByText('Incidents')).toBeTruthy()
    expect(screen.getAllByRole('tooltip')).toHaveLength(1)
  })

  it('renders incident badges', () => {
    render(<PeriodReport {...defaultProps} />)
    expect(screen.getByText('3 incidents')).toBeTruthy()
    expect(screen.getByText('2 medical')).toBeTruthy()
    expect(screen.getByText('1 behaviour')).toBeTruthy()
  })

  it('renders Staff Days Worked table', () => {
    render(<PeriodReport {...defaultProps} />)
    expect(screen.getByText('Staff Days Worked')).toBeTruthy()
    expect(screen.getByText('Jane Smith')).toBeTruthy()
    expect(screen.getByText('Ali Hassan')).toBeTruthy()
  })

  it('shows correct days worked fraction', () => {
    render(<PeriodReport {...defaultProps} />)
    expect(screen.getByText('6/8')).toBeTruthy()
    expect(screen.getByText('7/8')).toBeTruthy()
  })

  it('shows inline comma-separated sign-in dates with day abbreviations', () => {
    render(<PeriodReport {...defaultProps} />)
    // Jane Smith's dates rendered as comma-separated string
    expect(
      screen.getByText('Wed 4, Sat 7, Wed 11, Sat 14, Wed 18, Sat 21'),
    ).toBeTruthy()
  })

  it('renders Attendance Summary by Class table with attendance %, absences, late', () => {
    render(<PeriodReport {...defaultProps} />)
    expect(screen.getByText('Attendance Summary by Class')).toBeTruthy()
    expect(screen.getByText('Year 3A')).toBeTruthy()
    expect(screen.getByText('Year 4B')).toBeTruthy()
    // Attendance % column headers and values
    expect(screen.getByText('Attendance %')).toBeTruthy()
    expect(screen.getByText('Absences')).toBeTruthy()
    expect(screen.getByText('Late')).toBeTruthy()
  })

  it('handles empty staff data', () => {
    render(
      <PeriodReport
        {...defaultProps}
        staffDaysWorked={[]}
        schoolDayDates={
          [] as { date: string; staffCount: number; attendanceCount: number }[]
        }
        classSummary={[]}
        incidentCounts={{ medical: 0, behaviour: 0, other: 0, total: 0 }}
      />,
    )
    expect(
      screen.getByText('No staff attendance data for this period'),
    ).toBeTruthy()
    expect(screen.getByText('No attendance data for this period')).toBeTruthy()
  })
})
