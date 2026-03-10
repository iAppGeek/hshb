import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

vi.mock('./actions', () => ({
  updateStudentAction: vi.fn(),
}))

import EditStudentForm from './EditStudentForm'

beforeEach(() => {
  vi.clearAllMocks()
})

const guardians = [
  {
    id: 'guardian-1',
    first_name: 'Maria',
    last_name: 'Smith',
    phone: '07700 900000',
    email: 'maria@example.com',
  },
  {
    id: 'guardian-2',
    first_name: 'George',
    last_name: 'Jones',
    phone: '07700 900001',
    email: 'george@example.com',
  },
]

const baseStudent = {
  id: 'student-1',
  first_name: 'Anna',
  last_name: 'Papadopoulos',
  student_code: 'S001',
  date_of_birth: null,
  address_line_1: '1 Main Street',
  address_line_2: null,
  city: 'London',
  postcode: 'EC1A 1BB',
  allergies: null,
  medical_details: null,
  notes: null,
  primary_guardian_id: 'guardian-1',
  primary_guardian_relationship: 'Mother',
  secondary_guardian_id: null,
  secondary_guardian_relationship: null,
  additional_contact_1_id: null,
  additional_contact_1_relationship: null,
  additional_contact_2_id: null,
  additional_contact_2_relationship: null,
  student_classes: [],
}

describe('EditStudentForm', () => {
  it('renders student first and last name fields pre-filled', () => {
    render(<EditStudentForm student={baseStudent} guardians={guardians} />)
    expect((screen.getByDisplayValue('Anna') as HTMLInputElement).name).toBe(
      'student_first_name',
    )
    expect(
      (screen.getByDisplayValue('Papadopoulos') as HTMLInputElement).name,
    ).toBe('student_last_name')
  })

  it('shows Edit guardian link when a guardian is pre-selected', () => {
    render(<EditStudentForm student={baseStudent} guardians={guardians} />)
    const link = screen.getByRole('link', { name: 'Edit guardian' })
    expect(link.getAttribute('href')).toBe('/portal/guardians/guardian-1/edit')
  })

  it('does not show Edit guardian link when no guardian is pre-selected', () => {
    render(
      <EditStudentForm
        student={{ ...baseStudent, primary_guardian_id: null }}
        guardians={guardians}
      />,
    )
    expect(screen.queryByRole('link', { name: 'Edit guardian' })).toBeNull()
  })

  it('shows Save changes and Cancel buttons', () => {
    render(<EditStudentForm student={baseStudent} guardians={guardians} />)
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Cancel' })).toBeTruthy()
  })

  it('renders class checkboxes with enrolled ones pre-checked', () => {
    const classes = [
      { id: 'class-1', name: 'Year 1A', year_group: '1' },
      { id: 'class-2', name: 'Year 2B', year_group: '2' },
    ]
    render(
      <EditStudentForm
        student={baseStudent}
        guardians={guardians}
        classes={classes}
        enrolledClassIds={['class-1']}
      />,
    )
    const checkbox1 = screen.getByRole('checkbox', {
      name: /Year 1A/,
    }) as HTMLInputElement
    const checkbox2 = screen.getByRole('checkbox', {
      name: /Year 2B/,
    }) as HTMLInputElement
    expect(checkbox1.checked).toBe(true)
    expect(checkbox2.checked).toBe(false)
  })
})
