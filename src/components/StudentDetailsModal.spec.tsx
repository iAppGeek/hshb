import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import StudentDetailsModal from './StudentDetailsModal'

const onClose = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

const baseStudent = {
  id: 'student-1',
  first_name: 'Anna',
  last_name: 'Papadopoulos',
  primary_parent_name: 'Maria Papadopoulos',
  primary_parent_email: 'maria@example.com',
  primary_parent_phone: '07700 900000',
  secondary_parent_name: null,
  secondary_parent_email: null,
  secondary_parent_phone: null,
  emergency_contacts: [],
}

describe('StudentDetailsModal', () => {
  it('renders the student name in the heading', () => {
    render(<StudentDetailsModal student={baseStudent} onClose={onClose} />)
    expect(screen.getByText('Papadopoulos, Anna')).toBeTruthy()
  })

  it('renders primary parent name, email and phone', () => {
    render(<StudentDetailsModal student={baseStudent} onClose={onClose} />)
    expect(screen.getByText('Maria Papadopoulos')).toBeTruthy()
    expect(screen.getByText('maria@example.com')).toBeTruthy()
    expect(screen.getByText('07700 900000')).toBeTruthy()
  })

  it('shows fallback when no primary parent recorded', () => {
    render(
      <StudentDetailsModal
        student={{ ...baseStudent, primary_parent_name: null }}
        onClose={onClose}
      />,
    )
    expect(screen.getByText('No details recorded.')).toBeTruthy()
  })

  it('renders secondary parent section when present', () => {
    render(
      <StudentDetailsModal
        student={{
          ...baseStudent,
          secondary_parent_name: 'George Papadopoulos',
          secondary_parent_email: 'george@example.com',
          secondary_parent_phone: '07700 900001',
        }}
        onClose={onClose}
      />,
    )
    expect(screen.getByText(/Secondary Parent/)).toBeTruthy()
    expect(screen.getByText('George Papadopoulos')).toBeTruthy()
    expect(screen.getByText('george@example.com')).toBeTruthy()
  })

  it('does not render secondary parent section when null', () => {
    render(<StudentDetailsModal student={baseStudent} onClose={onClose} />)
    expect(screen.queryByText(/Secondary Parent/)).toBeNull()
  })

  it('renders emergency contacts with name, relationship and phone', () => {
    render(
      <StudentDetailsModal
        student={{
          ...baseStudent,
          emergency_contacts: [
            { name: 'Uncle Bob', relationship: 'Uncle', phone: '07700 900002' },
          ],
        }}
        onClose={onClose}
      />,
    )
    expect(screen.getByText('Uncle Bob')).toBeTruthy()
    expect(screen.getByText('(Uncle)')).toBeTruthy()
    expect(screen.getByText('07700 900002')).toBeTruthy()
  })

  it('renders multiple emergency contacts', () => {
    render(
      <StudentDetailsModal
        student={{
          ...baseStudent,
          emergency_contacts: [
            { name: 'Aunt Sue', relationship: 'Aunt', phone: '07700 111111' },
            { name: 'Grandpa John', relationship: 'Grandfather', phone: '07700 222222' },
          ],
        }}
        onClose={onClose}
      />,
    )
    expect(screen.getByText('Aunt Sue')).toBeTruthy()
    expect(screen.getByText('Grandpa John')).toBeTruthy()
  })

  it('does not render emergency contacts section when empty', () => {
    render(<StudentDetailsModal student={baseStudent} onClose={onClose} />)
    expect(screen.queryByText(/Emergency Contacts/)).toBeNull()
  })

  it('calls onClose when the close button is clicked', () => {
    render(<StudentDetailsModal student={baseStudent} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the backdrop is clicked', () => {
    const { container } = render(
      <StudentDetailsModal student={baseStudent} onClose={onClose} />,
    )
    fireEvent.click(container.firstChild!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when the dialog panel is clicked', () => {
    render(<StudentDetailsModal student={baseStudent} onClose={onClose} />)
    fireEvent.click(screen.getByText('Papadopoulos, Anna'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape key is pressed', () => {
    render(<StudentDetailsModal student={baseStudent} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose for other key presses', () => {
    render(<StudentDetailsModal student={baseStudent} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
