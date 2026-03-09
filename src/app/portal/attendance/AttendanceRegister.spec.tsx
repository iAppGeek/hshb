import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/db', () => ({
  getStudentsByClass: vi.fn(),
  getAttendanceByClassAndDate: vi.fn(),
}))

vi.mock('./AttendanceForm', () => ({
  default: vi.fn(() => <div>AttendanceForm</div>),
}))

import AttendanceRegister from './AttendanceRegister'
import AttendanceForm from './AttendanceForm'
import { getStudentsByClass, getAttendanceByClassAndDate } from '@/db'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockStudent = {
  id: 'student-1',
  first_name: 'Anna',
  last_name: 'Papadopoulos',
  student_code: 'S001',
}

describe('AttendanceRegister', () => {
  it('fetches students and attendance in parallel', async () => {
    vi.mocked(getStudentsByClass).mockResolvedValue([mockStudent] as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])

    render(
      await AttendanceRegister({ classId: 'class-1', date: '2024-06-15', className: 'Year 3A' }),
    )

    expect(getStudentsByClass).toHaveBeenCalledWith('class-1')
    expect(getAttendanceByClassAndDate).toHaveBeenCalledWith('class-1', '2024-06-15')
  })

  it('renders AttendanceForm with students and existing attendance', async () => {
    vi.mocked(getStudentsByClass).mockResolvedValue([mockStudent] as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([
      { id: 'att-1', student_id: 'student-1', status: 'absent', class_id: 'class-1', date: '2024-06-15' },
    ] as any)

    render(
      await AttendanceRegister({ classId: 'class-1', date: '2024-06-15', className: 'Year 3A' }),
    )

    expect(vi.mocked(AttendanceForm)).toHaveBeenCalledWith(
      expect.objectContaining({
        classId: 'class-1',
        date: '2024-06-15',
        students: [mockStudent],
        existing: { 'student-1': 'absent' },
      }),
      undefined,
    )
  })

  it('shows the class name and date in the summary line', async () => {
    vi.mocked(getStudentsByClass).mockResolvedValue([mockStudent] as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])

    render(
      await AttendanceRegister({ classId: 'class-1', date: '2024-06-15', className: 'Year 3A' }),
    )

    expect(screen.getByText(/Year 3A/)).toBeTruthy()
    expect(screen.getByText(/2024-06-15/)).toBeTruthy()
  })

  it('shows already-taken notice when existing attendance exists', async () => {
    vi.mocked(getStudentsByClass).mockResolvedValue([mockStudent] as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([
      { id: 'att-1', student_id: 'student-1', status: 'present', class_id: 'class-1', date: '2024-06-15' },
    ] as any)

    render(
      await AttendanceRegister({ classId: 'class-1', date: '2024-06-15', className: 'Year 3A' }),
    )

    expect(screen.getByText('(register already taken)')).toBeTruthy()
  })

  it('does not show already-taken notice when no existing attendance', async () => {
    vi.mocked(getStudentsByClass).mockResolvedValue([mockStudent] as any)
    vi.mocked(getAttendanceByClassAndDate).mockResolvedValue([])

    render(
      await AttendanceRegister({ classId: 'class-1', date: '2024-06-15', className: 'Year 3A' }),
    )

    expect(screen.queryByText('(register already taken)')).toBeNull()
  })
})
