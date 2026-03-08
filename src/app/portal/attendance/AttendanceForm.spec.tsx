import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('./actions', () => ({
  saveAttendanceAction: vi.fn().mockResolvedValue(undefined),
}))

import AttendanceForm from './AttendanceForm'
import { saveAttendanceAction } from './actions'

beforeEach(() => {
  vi.clearAllMocks()
})

const students = [
  { id: 'student-1', first_name: 'Anna', last_name: 'Papadopoulos', student_code: 'S001' },
  { id: 'student-2', first_name: 'Nick', last_name: 'Georgiou', student_code: 'S002' },
]

describe('AttendanceForm', () => {
  it('renders all students', () => {
    render(
      <AttendanceForm
        classId="class-1"
        date="2024-03-08"
        students={students}
        existing={{}}
      />,
    )

    expect(screen.getByText('Papadopoulos, Anna')).toBeTruthy()
    expect(screen.getByText('Georgiou, Nick')).toBeTruthy()
  })

  it('shows empty state when no students', () => {
    render(
      <AttendanceForm classId="class-1" date="2024-03-08" students={[]} existing={{}} />,
    )
    expect(screen.getByText('No students in this class.')).toBeTruthy()
  })

  it('pre-fills existing attendance status', () => {
    render(
      <AttendanceForm
        classId="class-1"
        date="2024-03-08"
        students={students}
        existing={{ 'student-1': 'absent', 'student-2': 'late' }}
      />,
    )
    // Summary bar should reflect existing statuses
    expect(screen.getByText('0 present')).toBeTruthy()
    expect(screen.getByText('1 late')).toBeTruthy()
    expect(screen.getByText('1 absent')).toBeTruthy()
  })

  it('defaults to present when no existing status', () => {
    render(
      <AttendanceForm
        classId="class-1"
        date="2024-03-08"
        students={students}
        existing={{}}
      />,
    )
    expect(screen.getByText('2 present')).toBeTruthy()
    expect(screen.getByText('0 absent')).toBeTruthy()
  })

  it('updates summary counts when status is toggled', () => {
    render(
      <AttendanceForm
        classId="class-1"
        date="2024-03-08"
        students={[students[0]]}
        existing={{}}
      />,
    )

    // Initially 1 present
    expect(screen.getByText('1 present')).toBeTruthy()

    // Click Absent button for this student (first one in the row)
    const absentButtons = screen.getAllByText('Absent')
    fireEvent.click(absentButtons[0])

    expect(screen.getByText('0 present')).toBeTruthy()
    expect(screen.getByText('1 absent')).toBeTruthy()
  })

  it('shows save register button', () => {
    render(
      <AttendanceForm
        classId="class-1"
        date="2024-03-08"
        students={students}
        existing={{}}
      />,
    )
    expect(screen.getByText('Save register')).toBeTruthy()
  })

  it('calls saveAttendanceAction on form submit', async () => {
    render(
      <AttendanceForm
        classId="class-1"
        date="2024-03-08"
        students={[students[0]]}
        existing={{}}
      />,
    )

    fireEvent.submit(screen.getByText('Save register').closest('form')!)

    // saveAttendanceAction is async — just verify it was called
    await vi.waitFor(() => {
      expect(saveAttendanceAction).toHaveBeenCalledTimes(1)
    })
  })
})
