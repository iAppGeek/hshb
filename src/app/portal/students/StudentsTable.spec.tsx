import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
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
    student_classes: [
      { class: { id: 'class-1', name: 'Year 1A', year_group: '1' } },
    ],
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
    student_classes: [
      { class: { id: 'class-1', name: 'Year 1A', year_group: '1' } },
    ],
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

describe('StudentsTable', () => {
  it('renders all student names', () => {
    render(<StudentsTable students={students} role="admin" />)
    expect(screen.getByText('Papadopoulos, Anna')).toBeTruthy()
    expect(screen.getByText('Georgiou, Nick')).toBeTruthy()
  })

  it('renders student codes', () => {
    render(<StudentsTable students={students} role="admin" />)
    expect(screen.getByText('S001')).toBeTruthy()
    expect(screen.getByText('S002')).toBeTruthy()
  })

  it('renders class names from student_classes', () => {
    render(<StudentsTable students={students} role="admin" />)
    expect(screen.getAllByText('Year 1A')).toHaveLength(2)
  })

  it('renders primary guardian name', () => {
    render(<StudentsTable students={students} role="admin" />)
    expect(screen.getByText('Maria Papadopoulos')).toBeTruthy()
  })

  it('shows dash when student code is null', () => {
    render(
      <StudentsTable
        students={[{ ...students[0], student_code: null }]}
        role="admin"
      />,
    )
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('shows dash when student has no classes', () => {
    render(
      <StudentsTable
        students={[{ ...students[0], student_classes: [] }]}
        role="admin"
      />,
    )
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('shows dash when primary guardian is null', () => {
    render(
      <StudentsTable
        students={[{ ...students[0], primary_guardian: null }]}
        role="admin"
      />,
    )
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('renders the Classes and Guardian column headers', () => {
    render(<StudentsTable students={students} role="admin" />)
    expect(screen.getByText('Classes')).toBeTruthy()
    expect(screen.getByText('Guardian')).toBeTruthy()
  })

  it('renders a Details button for each student', () => {
    render(<StudentsTable students={students} role="admin" />)
    expect(screen.getAllByRole('button', { name: 'Details' })).toHaveLength(2)
  })

  it('opens modal for the clicked student', () => {
    render(<StudentsTable students={students} role="admin" />)
    expect(screen.queryByTestId('student-modal')).toBeNull()

    fireEvent.click(screen.getAllByRole('button', { name: 'Details' })[0])

    const modal = screen.getByTestId('student-modal')
    expect(within(modal).getByText('Papadopoulos, Anna')).toBeTruthy()
  })

  it('opens modal for the correct student when second row is clicked', () => {
    render(<StudentsTable students={students} role="admin" />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Details' })[1])
    expect(
      within(screen.getByTestId('student-modal')).getByText('Georgiou, Nick'),
    ).toBeTruthy()
  })

  it('closes the modal when onClose is called', () => {
    render(<StudentsTable students={students} role="admin" />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Details' })[0])
    expect(screen.getByTestId('student-modal')).toBeTruthy()

    fireEvent.click(screen.getByText('Close modal'))
    expect(screen.queryByTestId('student-modal')).toBeNull()
  })

  it('only shows one modal at a time', () => {
    render(<StudentsTable students={students} role="admin" />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Details' })[0])
    fireEvent.click(screen.getAllByRole('button', { name: 'Details' })[1])
    expect(screen.getAllByTestId('student-modal')).toHaveLength(1)
    expect(
      within(screen.getByTestId('student-modal')).getByText('Georgiou, Nick'),
    ).toBeTruthy()
  })

  it('shows Edit links for admin with correct hrefs', () => {
    render(<StudentsTable students={students} role="admin" />)
    const editLinks = screen.getAllByRole('link', { name: 'Edit' })
    expect(editLinks).toHaveLength(2)
    expect(editLinks[0].getAttribute('href')).toBe(
      '/portal/students/student-1/edit',
    )
    expect(editLinks[1].getAttribute('href')).toBe(
      '/portal/students/student-2/edit',
    )
  })

  it('does not show Edit links for teacher', () => {
    render(<StudentsTable students={students} role="teacher" />)
    expect(screen.queryByRole('link', { name: 'Edit' })).toBeNull()
  })

  it('does not show Edit links for headteacher', () => {
    render(<StudentsTable students={students} role="headteacher" />)
    expect(screen.queryByRole('link', { name: 'Edit' })).toBeNull()
  })
})
