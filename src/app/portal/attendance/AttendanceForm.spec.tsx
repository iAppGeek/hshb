import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'

vi.mock('./actions', () => ({
  saveAttendanceAction: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/components/StudentDetailsModal', () => ({
  default: ({
    student,
    onClose,
  }: {
    student: { first_name: string; last_name: string }
    onClose: () => void
  }) => (
    <div data-testid="student-modal">
      <span>
        {student.last_name}, {student.first_name}
      </span>
      <button onClick={onClose}>Close modal</button>
    </div>
  ),
}))

import AttendanceForm from './AttendanceForm'
import { saveAttendanceAction } from './actions'

beforeEach(() => {
  vi.clearAllMocks()
})

const students = [
  {
    id: 'student-1',
    first_name: 'Anna',
    last_name: 'Papadopoulos',
    student_code: 'S001',
    primary_parent_name: 'Maria Papadopoulos',
    primary_parent_email: 'maria@example.com',
    primary_parent_phone: '07700 900000',
    secondary_parent_name: null,
    secondary_parent_email: null,
    secondary_parent_phone: null,
    emergency_contacts: [],
  },
  {
    id: 'student-2',
    first_name: 'Nick',
    last_name: 'Georgiou',
    student_code: 'S002',
    primary_parent_name: 'Eleni Georgiou',
    primary_parent_email: null,
    primary_parent_phone: null,
    secondary_parent_name: null,
    secondary_parent_email: null,
    secondary_parent_phone: null,
    emergency_contacts: [],
  },
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
      <AttendanceForm
        classId="class-1"
        date="2024-03-08"
        students={[]}
        existing={{}}
      />,
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
    expect(screen.getByText('0 present')).toBeTruthy()
    expect(screen.getByText('1 late')).toBeTruthy()
    expect(screen.getByText('1 absent')).toBeTruthy()
  })

  it('shows no selection by default when no existing status', () => {
    render(
      <AttendanceForm
        classId="class-1"
        date="2024-03-08"
        students={students}
        existing={{}}
      />,
    )
    expect(screen.getByText('0 present')).toBeTruthy()
    expect(screen.getByText('2 unmarked')).toBeTruthy()
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

    expect(screen.getByText('1 unmarked')).toBeTruthy()

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

    await vi.waitFor(() => {
      expect(saveAttendanceAction).toHaveBeenCalledTimes(1)
    })
  })

  it('renders a Details button for each student', () => {
    render(
      <AttendanceForm
        classId="class-1"
        date="2024-03-08"
        students={students}
        existing={{}}
      />,
    )
    expect(screen.getAllByRole('button', { name: 'Details' })).toHaveLength(2)
  })

  it('opens the modal when Details is clicked', () => {
    render(
      <AttendanceForm
        classId="class-1"
        date="2024-03-08"
        students={students}
        existing={{}}
      />,
    )
    expect(screen.queryByTestId('student-modal')).toBeNull()

    fireEvent.click(screen.getAllByRole('button', { name: 'Details' })[0])

    expect(
      within(screen.getByTestId('student-modal')).getByText(
        'Papadopoulos, Anna',
      ),
    ).toBeTruthy()
  })

  it('closes the modal when onClose is called', () => {
    render(
      <AttendanceForm
        classId="class-1"
        date="2024-03-08"
        students={students}
        existing={{}}
      />,
    )
    fireEvent.click(screen.getAllByRole('button', { name: 'Details' })[0])
    expect(screen.getByTestId('student-modal')).toBeTruthy()

    fireEvent.click(screen.getByText('Close modal'))
    expect(screen.queryByTestId('student-modal')).toBeNull()
  })
})
