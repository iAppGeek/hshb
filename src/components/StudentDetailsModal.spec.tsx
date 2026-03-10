import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

import StudentDetailsModal from './StudentDetailsModal'

const onClose = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

const primaryGuardian = {
  first_name: 'Maria',
  last_name: 'Papadopoulos',
  phone: '07700 900000',
  email: 'maria@example.com',
  address_line_1: '1 Main Street',
  address_line_2: null,
  city: 'London',
  postcode: 'EC1A 1BB',
  notes: null,
}

const baseStudent = {
  id: 'student-1',
  first_name: 'Anna',
  last_name: 'Papadopoulos',
  address_line_1: null,
  address_line_2: null,
  city: null,
  postcode: null,
  allergies: null,
  notes: null,
  medical_details: null,
  primary_guardian_id: 'guardian-1',
  primary_guardian: primaryGuardian,
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
}

describe('StudentDetailsModal', () => {
  it('renders the student name in the heading', () => {
    render(
      <StudentDetailsModal
        student={baseStudent}
        role="admin"
        onClose={onClose}
      />,
    )
    expect(screen.getByText('Papadopoulos, Anna')).toBeTruthy()
  })

  it('renders primary guardian name, email and phone', () => {
    render(
      <StudentDetailsModal
        student={baseStudent}
        role="admin"
        onClose={onClose}
      />,
    )
    expect(screen.getByText('Maria Papadopoulos')).toBeTruthy()
    expect(screen.getByText('maria@example.com')).toBeTruthy()
    expect(screen.getByText('07700 900000')).toBeTruthy()
  })

  it('renders primary guardian relationship', () => {
    render(
      <StudentDetailsModal
        student={baseStudent}
        role="admin"
        onClose={onClose}
      />,
    )
    expect(screen.getByText('(Mother)')).toBeTruthy()
  })

  it('does not render relationship when null', () => {
    render(
      <StudentDetailsModal
        student={{ ...baseStudent, primary_guardian_relationship: null }}
        role="admin"
        onClose={onClose}
      />,
    )
    expect(screen.queryByText(/\(Mother\)/)).toBeNull()
  })

  it('renders primary guardian address', () => {
    render(
      <StudentDetailsModal
        student={baseStudent}
        role="admin"
        onClose={onClose}
      />,
    )
    expect(screen.getByText('1 Main Street')).toBeTruthy()
    expect(screen.getByText('London, EC1A 1BB')).toBeTruthy()
  })

  it('shows fallback when no primary guardian recorded', () => {
    render(
      <StudentDetailsModal
        student={{ ...baseStudent, primary_guardian: null }}
        role="admin"
        onClose={onClose}
      />,
    )
    expect(screen.getByText('No details recorded.')).toBeTruthy()
  })

  it('renders student address section when present', () => {
    render(
      <StudentDetailsModal
        student={{
          ...baseStudent,
          address_line_1: '5 School Road',
          city: 'Manchester',
          postcode: 'M1 1AA',
        }}
        role="admin"
        onClose={onClose}
      />,
    )
    expect(screen.getByText(/Student Address/)).toBeTruthy()
    expect(screen.getByText('5 School Road')).toBeTruthy()
    expect(screen.getByText('Manchester, M1 1AA')).toBeTruthy()
  })

  it('does not render student address section when all address fields are null', () => {
    render(
      <StudentDetailsModal
        student={baseStudent}
        role="admin"
        onClose={onClose}
      />,
    )
    expect(screen.queryByText(/Student Address/)).toBeNull()
  })

  it('renders secondary guardian section when present', () => {
    render(
      <StudentDetailsModal
        student={{
          ...baseStudent,
          secondary_guardian: {
            first_name: 'George',
            last_name: 'Papadopoulos',
            phone: '07700 900001',
            email: 'george@example.com',
            address_line_1: null,
            address_line_2: null,
            city: null,
            postcode: null,
            notes: null,
          },
        }}
        role="admin"
        onClose={onClose}
      />,
    )
    expect(screen.getByText(/Secondary Guardian/)).toBeTruthy()
    expect(screen.getByText('George Papadopoulos')).toBeTruthy()
    expect(screen.getByText('george@example.com')).toBeTruthy()
  })

  it('does not render secondary guardian section when null', () => {
    render(
      <StudentDetailsModal
        student={baseStudent}
        role="admin"
        onClose={onClose}
      />,
    )
    expect(screen.queryByText(/Secondary Guardian/)).toBeNull()
  })

  it('renders additional contact 1 when present', () => {
    render(
      <StudentDetailsModal
        student={{
          ...baseStudent,
          additional_contact_1: {
            first_name: 'Uncle',
            last_name: 'Bob',
            phone: '07700 900002',
          },
        }}
        role="admin"
        onClose={onClose}
      />,
    )
    expect(screen.getByText(/Additional Contact 1/)).toBeTruthy()
    expect(screen.getByText('Uncle Bob')).toBeTruthy()
    expect(screen.getByText('07700 900002')).toBeTruthy()
  })

  it('renders additional contact 2 when present', () => {
    render(
      <StudentDetailsModal
        student={{
          ...baseStudent,
          additional_contact_2: {
            first_name: 'Aunt',
            last_name: 'Sue',
            phone: '07700 900003',
          },
        }}
        role="admin"
        onClose={onClose}
      />,
    )
    expect(screen.getByText(/Additional Contact 2/)).toBeTruthy()
    expect(screen.getByText('Aunt Sue')).toBeTruthy()
  })

  it('does not render additional contact sections when null', () => {
    render(
      <StudentDetailsModal
        student={baseStudent}
        role="admin"
        onClose={onClose}
      />,
    )
    expect(screen.queryByText(/Additional Contact/)).toBeNull()
  })

  it('always renders the Allergies section', () => {
    render(
      <StudentDetailsModal
        student={baseStudent}
        role="teacher"
        onClose={onClose}
      />,
    )
    expect(screen.getByText(/Allergies/i)).toBeTruthy()
  })

  it('shows N/A for allergies when none set', () => {
    render(
      <StudentDetailsModal
        student={baseStudent}
        role="admin"
        onClose={onClose}
      />,
    )
    expect(screen.getByText('N/A')).toBeTruthy()
  })

  it('shows allergies value when set', () => {
    render(
      <StudentDetailsModal
        student={{ ...baseStudent, allergies: 'Peanuts, Gluten' }}
        role="admin"
        onClose={onClose}
      />,
    )
    expect(screen.getByText('Peanuts, Gluten')).toBeTruthy()
  })

  it('shows Medical Details section for admin', () => {
    render(
      <StudentDetailsModal
        student={{ ...baseStudent, medical_details: 'Asthma' }}
        role="admin"
        onClose={onClose}
      />,
    )
    expect(screen.getByText(/Medical Details/i)).toBeTruthy()
    expect(screen.getByText('Asthma')).toBeTruthy()
  })

  it('shows Medical Details section for headteacher', () => {
    render(
      <StudentDetailsModal
        student={{ ...baseStudent, medical_details: 'Asthma' }}
        role="headteacher"
        onClose={onClose}
      />,
    )
    expect(screen.getByText(/Medical Details/i)).toBeTruthy()
  })

  it('does not show Medical Details section for teacher', () => {
    render(
      <StudentDetailsModal
        student={{ ...baseStudent, medical_details: 'Asthma' }}
        role="teacher"
        onClose={onClose}
      />,
    )
    expect(screen.queryByText(/Medical Details/i)).toBeNull()
    expect(screen.queryByText('Asthma')).toBeNull()
  })

  it('shows Notes section for admin', () => {
    render(
      <StudentDetailsModal
        student={{ ...baseStudent, notes: 'Needs extra support' }}
        role="admin"
        onClose={onClose}
      />,
    )
    expect(screen.getByText(/^Notes$/i)).toBeTruthy()
    expect(screen.getByText('Needs extra support')).toBeTruthy()
  })

  it('shows Notes section for headteacher', () => {
    render(
      <StudentDetailsModal
        student={{ ...baseStudent, notes: 'Some notes' }}
        role="headteacher"
        onClose={onClose}
      />,
    )
    expect(screen.getByText(/^Notes$/i)).toBeTruthy()
  })

  it('does not show Notes section for teacher', () => {
    render(
      <StudentDetailsModal
        student={{ ...baseStudent, notes: 'Hidden notes' }}
        role="teacher"
        onClose={onClose}
      />,
    )
    expect(screen.queryByText(/^Notes$/i)).toBeNull()
    expect(screen.queryByText('Hidden notes')).toBeNull()
  })

  it('calls onClose when the close button is clicked', () => {
    render(
      <StudentDetailsModal
        student={baseStudent}
        role="admin"
        onClose={onClose}
      />,
    )
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the backdrop is clicked', () => {
    const { container } = render(
      <StudentDetailsModal
        student={baseStudent}
        role="admin"
        onClose={onClose}
      />,
    )
    fireEvent.click(container.firstChild!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when the dialog panel is clicked', () => {
    render(
      <StudentDetailsModal
        student={baseStudent}
        role="admin"
        onClose={onClose}
      />,
    )
    fireEvent.click(screen.getByText('Papadopoulos, Anna'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape key is pressed', () => {
    render(
      <StudentDetailsModal
        student={baseStudent}
        role="admin"
        onClose={onClose}
      />,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose for other key presses', () => {
    render(
      <StudentDetailsModal
        student={baseStudent}
        role="admin"
        onClose={onClose}
      />,
    )
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('shows guardian Edit link for admin with correct href', () => {
    render(
      <StudentDetailsModal
        student={baseStudent}
        role="admin"
        onClose={onClose}
      />,
    )
    const editLink = screen.getByRole('link', { name: 'Edit' })
    expect(editLink.getAttribute('href')).toBe(
      '/portal/guardians/guardian-1/edit',
    )
  })

  it('does not show guardian Edit link for teacher', () => {
    render(
      <StudentDetailsModal
        student={baseStudent}
        role="teacher"
        onClose={onClose}
      />,
    )
    expect(screen.queryByRole('link', { name: 'Edit' })).toBeNull()
  })

  it('does not show guardian Edit link for headteacher', () => {
    render(
      <StudentDetailsModal
        student={baseStudent}
        role="headteacher"
        onClose={onClose}
      />,
    )
    expect(screen.queryByRole('link', { name: 'Edit' })).toBeNull()
  })

  it('shows Edit links for each guardian when multiple are present', () => {
    render(
      <StudentDetailsModal
        student={{
          ...baseStudent,
          secondary_guardian_id: 'guardian-2',
          secondary_guardian: {
            first_name: 'George',
            last_name: 'Papadopoulos',
            phone: '07700 900001',
            email: null,
            address_line_1: null,
            address_line_2: null,
            city: null,
            postcode: null,
            notes: null,
          },
        }}
        role="admin"
        onClose={onClose}
      />,
    )
    const editLinks = screen.getAllByRole('link', { name: 'Edit' })
    expect(editLinks).toHaveLength(2)
    const hrefs = editLinks.map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('/portal/guardians/guardian-1/edit')
    expect(hrefs).toContain('/portal/guardians/guardian-2/edit')
  })
})
