import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/db', () => ({
  getAllClasses: vi.fn(),
  getClassesByTeacher: vi.fn(),
  getStudentsByClass: vi.fn(),
  getAttendanceByClassAndDate: vi.fn(),
}))

vi.mock('./AttendanceForm', () => ({
  default: vi.fn(() => <div>AttendanceForm</div>),
}))

import AttendancePage from './page'
import AttendanceForm from './AttendanceForm'
import { auth } from '@/auth'
import {
  getAllClasses,
  getClassesByTeacher,
  getStudentsByClass,
  getAttendanceByClassAndDate,
} from '@/db'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockClass = { id: 'class-1', name: 'Year 3A', year_group: '3', academic_year: '2025-26' }
const mockStudent = { id: 'student-1', first_name: 'Anna', last_name: 'Papadopoulos', student_code: 'S001' }

describe('AttendancePage', () => {
  it('renders the Attendance Register heading', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin', staffId: 'staff-1' } } as any)
    vi.mocked(getAllClasses).mockResolvedValue([mockClass] as any)
    vi.mocked(getStudentsByClass).mockResolvedValue([mockStudent] as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])

    render(await AttendancePage({ searchParams: Promise.resolve({}) }))
    expect(screen.getByText('Attendance Register')).toBeTruthy()
  })

  it('shows empty state when no classes are assigned', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'teacher', staffId: 'staff-1' } } as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue([])

    render(await AttendancePage({ searchParams: Promise.resolve({}) }))
    expect(screen.getByText('No classes assigned.')).toBeTruthy()
  })

  it('fetches all classes for admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin', staffId: 'staff-1' } } as any)
    vi.mocked(getAllClasses).mockResolvedValue([mockClass] as any)
    vi.mocked(getStudentsByClass).mockResolvedValue([])
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])

    await AttendancePage({ searchParams: Promise.resolve({}) })
    expect(getAllClasses).toHaveBeenCalled()
    expect(getClassesByTeacher).not.toHaveBeenCalled()
  })

  it('fetches only teacher classes for teacher role', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'teacher', staffId: 'staff-2' } } as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue([mockClass] as any)
    vi.mocked(getStudentsByClass).mockResolvedValue([])
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])

    await AttendancePage({ searchParams: Promise.resolve({}) })
    expect(getClassesByTeacher).toHaveBeenCalledWith('staff-2')
    expect(getAllClasses).not.toHaveBeenCalled()
  })

  it('renders AttendanceForm when a class is selected', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin', staffId: 'staff-1' } } as any)
    vi.mocked(getAllClasses).mockResolvedValue([mockClass] as any)
    vi.mocked(getStudentsByClass).mockResolvedValue([mockStudent] as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])

    render(
      await AttendancePage({
        searchParams: Promise.resolve({ classId: 'class-1', date: '2024-03-08' }),
      }),
    )
    expect(screen.getByText('AttendanceForm')).toBeTruthy()
  })

  it('shows already-taken notice when existing attendance exists', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin', staffId: 'staff-1' } } as any)
    vi.mocked(getAllClasses).mockResolvedValue([mockClass] as any)
    vi.mocked(getStudentsByClass).mockResolvedValue([mockStudent] as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([
      { id: 'att-1', student_id: 'student-1', status: 'present' },
    ] as any)

    render(
      await AttendancePage({
        searchParams: Promise.resolve({ classId: 'class-1', date: '2024-03-08' }),
      }),
    )
    expect(screen.getByText('(register already taken)')).toBeTruthy()
  })

  it('queries attendance for the specific date from searchParams', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin', staffId: 'staff-1' } } as any)
    vi.mocked(getAllClasses).mockResolvedValue([mockClass] as any)
    vi.mocked(getStudentsByClass).mockResolvedValue([mockStudent] as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])

    await AttendancePage({
      searchParams: Promise.resolve({ classId: 'class-1', date: '2024-06-15' }),
    })

    expect(getAttendanceByClassAndDate).toHaveBeenCalledWith('class-1', '2024-06-15')
  })

  it('passes existing attendance statuses to AttendanceForm for the given date', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin', staffId: 'staff-1' } } as any)
    vi.mocked(getAllClasses).mockResolvedValue([mockClass] as any)
    vi.mocked(getStudentsByClass).mockResolvedValue([mockStudent] as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([
      { id: 'att-1', student_id: 'student-1', status: 'absent', class_id: 'class-1', date: '2024-06-15' },
    ] as any)

    render(
      await AttendancePage({
        searchParams: Promise.resolve({ classId: 'class-1', date: '2024-06-15' }),
      }),
    )

    expect(vi.mocked(AttendanceForm)).toHaveBeenCalledWith(
      expect.objectContaining({
        date: '2024-06-15',
        existing: { 'student-1': 'absent' },
      }),
      undefined,
    )
  })

  it('shows the selected date in the class/date summary line', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin', staffId: 'staff-1' } } as any)
    vi.mocked(getAllClasses).mockResolvedValue([mockClass] as any)
    vi.mocked(getStudentsByClass).mockResolvedValue([mockStudent] as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])

    render(
      await AttendancePage({
        searchParams: Promise.resolve({ classId: 'class-1', date: '2024-06-15' }),
      }),
    )

    expect(screen.getByText(/2024-06-15/)).toBeTruthy()
  })

  it('defaults to today when no date is provided in searchParams', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin', staffId: 'staff-1' } } as any)
    vi.mocked(getAllClasses).mockResolvedValue([mockClass] as any)
    vi.mocked(getStudentsByClass).mockResolvedValue([mockStudent] as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])

    const today = new Date().toISOString().split('T')[0]

    await AttendancePage({ searchParams: Promise.resolve({ classId: 'class-1' }) })

    expect(getAttendanceByClassAndDate).toHaveBeenCalledWith('class-1', today)
  })
})
