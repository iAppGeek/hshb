import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/db', () => ({
  getAllClasses: vi.fn(),
  getClassesByTeacher: vi.fn(),
}))

vi.mock('./AttendanceFilters', () => ({
  default: vi.fn(({ classes, selectedClassId, selectedDate }) => (
    <div data-testid="attendance-filters">
      {classes.map((c: { id: string; name: string }) => (
        <span key={c.id}>{c.name}</span>
      ))}
      <span>{selectedClassId}</span>
      <span>{selectedDate}</span>
    </div>
  )),
}))

vi.mock('./AttendanceRegister', () => ({
  default: vi.fn(({ classId, date, className }) => (
    <div data-testid="attendance-register">
      {classId} {date} {className}
    </div>
  )),
}))

import { auth } from '@/auth'
import { getAllClasses, getClassesByTeacher } from '@/db'

import AttendancePage from './page'
import AttendanceFilters from './AttendanceFilters'
import AttendanceRegister from './AttendanceRegister'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockClass = {
  id: 'class-1',
  name: 'Year 3A',
  year_group: '3',
  academic_year: '2025-26',
}

describe('AttendancePage', () => {
  it('renders the Attendance Register heading', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllClasses).mockResolvedValue([mockClass] as any)

    render(await AttendancePage({ searchParams: Promise.resolve({}) }))
    expect(screen.getByText('Attendance Register')).toBeTruthy()
  })

  it('shows empty state when no classes are assigned', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-1' },
    } as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue([])

    render(await AttendancePage({ searchParams: Promise.resolve({}) }))
    expect(screen.getByText('No classes assigned.')).toBeTruthy()
  })

  it('fetches all classes for admin', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllClasses).mockResolvedValue([mockClass] as any)

    await AttendancePage({ searchParams: Promise.resolve({}) })
    expect(getAllClasses).toHaveBeenCalled()
    expect(getClassesByTeacher).not.toHaveBeenCalled()
  })

  it('fetches only teacher classes for teacher role', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-2' },
    } as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue([mockClass] as any)

    await AttendancePage({ searchParams: Promise.resolve({}) })
    expect(getClassesByTeacher).toHaveBeenCalledWith('staff-2')
    expect(getAllClasses).not.toHaveBeenCalled()
  })

  it('passes classes, selectedClassId, and selectedDate to AttendanceFilters', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllClasses).mockResolvedValue([mockClass] as any)

    render(
      await AttendancePage({
        searchParams: Promise.resolve({
          classId: 'class-1',
          date: '2024-06-15',
        }),
      }),
    )

    expect(vi.mocked(AttendanceFilters)).toHaveBeenCalledWith(
      expect.objectContaining({
        classes: [mockClass],
        selectedClassId: 'class-1',
        selectedDate: '2024-06-15',
      }),
      undefined,
    )
  })

  it('renders AttendanceRegister with correct classId, date, and className', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllClasses).mockResolvedValue([mockClass] as any)

    render(
      await AttendancePage({
        searchParams: Promise.resolve({
          classId: 'class-1',
          date: '2024-06-15',
        }),
      }),
    )

    expect(vi.mocked(AttendanceRegister)).toHaveBeenCalledWith(
      expect.objectContaining({
        classId: 'class-1',
        date: '2024-06-15',
        className: 'Year 3A',
        role: 'admin',
      }),
      undefined,
    )
  })

  it('defaults to today when no date is provided', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllClasses).mockResolvedValue([mockClass] as any)

    const today = new Date().toISOString().split('T')[0]

    render(
      await AttendancePage({
        searchParams: Promise.resolve({ classId: 'class-1' }),
      }),
    )

    expect(vi.mocked(AttendanceRegister)).toHaveBeenCalledWith(
      expect.objectContaining({ date: today }),
      undefined,
    )
  })

  it('defaults to the first class when no classId is in searchParams', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllClasses).mockResolvedValue([mockClass] as any)

    render(await AttendancePage({ searchParams: Promise.resolve({}) }))

    expect(vi.mocked(AttendanceRegister)).toHaveBeenCalledWith(
      expect.objectContaining({ classId: 'class-1' }),
      undefined,
    )
  })

  it('keeps filters visible and hides register content while AttendanceRegister is loading', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllClasses).mockResolvedValue([mockClass] as any)

    // Use mockImplementation (not Once) so React's internal Suspense retries also suspend.
    // React retries suspended components within act(), consuming a mockImplementationOnce.
    const neverResolves = new Promise<void>(() => {})
    vi.mocked(AttendanceRegister).mockImplementation((): never => {
      throw neverResolves
    })

    const { container } = render(
      await AttendancePage({
        searchParams: Promise.resolve({
          classId: 'class-1',
          date: '2024-06-15',
        }),
      }),
    )

    // Filters remain visible while the register loads — the key UX requirement
    expect(screen.getByTestId('attendance-filters')).toBeTruthy()
    // Register content is not shown while suspended
    expect(screen.queryByTestId('attendance-register')).toBeNull()
    // The Suspense fallback skeleton is shown in place of the register
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })
})
