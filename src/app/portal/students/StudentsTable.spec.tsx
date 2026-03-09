import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'

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

import StudentsTable from './StudentsTable'

beforeEach(() => {
  vi.clearAllMocks()
})

const students = [
  {
    id: 'student-1',
    first_name: 'Anna',
    last_name: 'Papadopoulos',
    student_code: 'S001',
    class: { id: 'class-1', name: 'Year 1A', year_group: '1' },
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
    class: { id: 'class-1', name: 'Year 1A', year_group: '1' },
    primary_parent_name: 'Eleni Georgiou',
    primary_parent_email: null,
    primary_parent_phone: null,
    secondary_parent_name: null,
    secondary_parent_email: null,
    secondary_parent_phone: null,
    emergency_contacts: [],
  },
]

describe('StudentsTable', () => {
  it('renders all student names', () => {
    render(<StudentsTable students={students} />)
    expect(screen.getByText('Papadopoulos, Anna')).toBeTruthy()
    expect(screen.getByText('Georgiou, Nick')).toBeTruthy()
  })

  it('renders student codes', () => {
    render(<StudentsTable students={students} />)
    expect(screen.getByText('S001')).toBeTruthy()
    expect(screen.getByText('S002')).toBeTruthy()
  })

  it('renders class name', () => {
    render(<StudentsTable students={students} />)
    expect(screen.getAllByText('Year 1A')).toHaveLength(2)
  })

  it('renders primary parent name', () => {
    render(<StudentsTable students={students} />)
    expect(screen.getByText('Maria Papadopoulos')).toBeTruthy()
  })

  it('shows dash when student code is null', () => {
    render(
      <StudentsTable students={[{ ...students[0], student_code: null }]} />,
    )
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('shows dash when class is null', () => {
    render(<StudentsTable students={[{ ...students[0], class: null }]} />)
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('renders a Details button for each student', () => {
    render(<StudentsTable students={students} />)
    expect(screen.getAllByRole('button', { name: 'Details' })).toHaveLength(2)
  })

  it('opens modal for the clicked student', () => {
    render(<StudentsTable students={students} />)
    expect(screen.queryByTestId('student-modal')).toBeNull()

    fireEvent.click(screen.getAllByRole('button', { name: 'Details' })[0])

    const modal = screen.getByTestId('student-modal')
    expect(within(modal).getByText('Papadopoulos, Anna')).toBeTruthy()
  })

  it('opens modal for the correct student when second row is clicked', () => {
    render(<StudentsTable students={students} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Details' })[1])
    expect(
      within(screen.getByTestId('student-modal')).getByText('Georgiou, Nick'),
    ).toBeTruthy()
  })

  it('closes the modal when onClose is called', () => {
    render(<StudentsTable students={students} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Details' })[0])
    expect(screen.getByTestId('student-modal')).toBeTruthy()

    fireEvent.click(screen.getByText('Close modal'))
    expect(screen.queryByTestId('student-modal')).toBeNull()
  })

  it('only shows one modal at a time', () => {
    render(<StudentsTable students={students} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Details' })[0])
    fireEvent.click(screen.getAllByRole('button', { name: 'Details' })[1])
    expect(screen.getAllByTestId('student-modal')).toHaveLength(1)
    expect(
      within(screen.getByTestId('student-modal')).getByText('Georgiou, Nick'),
    ).toBeTruthy()
  })
})
