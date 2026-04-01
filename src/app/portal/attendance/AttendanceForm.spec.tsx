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
    student_classes: [],
    address_guardian_id: null,
    address_guardian: null,
    address_line_1: null,
    address_line_2: null,
    city: null,
    postcode: null,
    allergies: null,
    notes: null,
    medical_details: null,
    primary_guardian_id: 'guardian-1',
    primary_guardian: {
      first_name: 'Maria',
      last_name: 'Papadopoulos',
      phone: '07700 900000',
      email: 'maria@example.com',
      address_line_1: null,
      address_line_2: null,
      city: null,
      postcode: null,
      notes: null,
    },
    primary_guardian_relationship: 'Mother',
    secondary_guardian_id: null,
    secondary_guardian: null,
    secondary_guardian_relationship: null,
    additional_contact_1_id: null,
    additional_contact_1: null,
    additional_contact_1_relationship: null,
    additional_contact_2_id: null,
    additional_contact_2: null,
    additional_contact_2_relationship: null,
  },
  {
    id: 'student-2',
    first_name: 'Nick',
    last_name: 'Georgiou',
    student_code: 'S002',
    student_classes: [],
    address_guardian_id: null,
    address_guardian: null,
    address_line_1: null,
    address_line_2: null,
    city: null,
    postcode: null,
    allergies: null,
    notes: null,
    medical_details: null,
    primary_guardian_id: 'guardian-2',
    primary_guardian: {
      first_name: 'Eleni',
      last_name: 'Georgiou',
      phone: '07700 900001',
      email: null,
      address_line_1: null,
      address_line_2: null,
      city: null,
      postcode: null,
      notes: null,
    },
    primary_guardian_relationship: null,
    secondary_guardian_id: null,
    secondary_guardian: null,
    secondary_guardian_relationship: null,
    additional_contact_1_id: null,
    additional_contact_1: null,
    additional_contact_1_relationship: null,
    additional_contact_2_id: null,
    additional_contact_2: null,
    additional_contact_2_relationship: null,
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
        role="admin"
        hasExisting={false}
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
        role="admin"
        hasExisting={false}
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
        role="admin"
        hasExisting={false}
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
        role="admin"
        hasExisting={false}
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
        role="admin"
        hasExisting={false}
      />,
    )

    expect(screen.getByText('1 unmarked')).toBeTruthy()

    fireEvent.click(screen.getAllByRole('button', { name: 'Absent' })[0])

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
        role="admin"
        hasExisting={false}
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
        role="admin"
        hasExisting={false}
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
        role="admin"
        hasExisting={false}
      />,
    )
    // Details button renders twice per student (mobile card + desktop column)
    expect(screen.getAllByRole('button', { name: 'Details' })).toHaveLength(4)
  })

  it('opens the modal when Details is clicked', () => {
    render(
      <AttendanceForm
        classId="class-1"
        date="2024-03-08"
        students={students}
        existing={{}}
        role="admin"
        hasExisting={false}
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
        role="admin"
        hasExisting={false}
      />,
    )
    fireEvent.click(screen.getAllByRole('button', { name: 'Details' })[0])
    expect(screen.getByTestId('student-modal')).toBeTruthy()

    fireEvent.click(screen.getByText('Close modal'))
    expect(screen.queryByTestId('student-modal')).toBeNull()
  })

  it('shows disabled save button for secretary when hasExisting is true', () => {
    render(
      <AttendanceForm
        classId="class-1"
        date="2024-03-08"
        students={students}
        existing={{ 'student-1': 'present', 'student-2': 'present' }}
        role="secretary"
        hasExisting
      />,
    )

    // The save button is rendered as a non-interactive span (not a <button>)
    const saveText = screen.getByText('Save register')
    expect(saveText.tagName).not.toBe('BUTTON')
    expect(saveText.closest('span')).toBeTruthy()
  })

  it('shows enabled save button for secretary when hasExisting is false', () => {
    render(
      <AttendanceForm
        classId="class-1"
        date="2024-03-08"
        students={[students[0]]}
        existing={{}}
        role="secretary"
        hasExisting={false}
      />,
    )

    // Mark student so button is enabled
    fireEvent.click(screen.getAllByRole('button', { name: 'Present' })[0])

    const saveButton = screen.getByText('Save register')
    expect(saveButton.tagName).toBe('BUTTON')
  })
})
