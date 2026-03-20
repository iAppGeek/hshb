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

import ClassesTable, { type ClassRow } from './ClassesTable'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockClasses: ClassRow[] = [
  {
    id: 'class-1',
    name: 'Year 1A',
    year_group: '1',
    room_number: 'R1',
    academic_year: '2024/25',
    active: true,
    teacher: { first_name: 'Jane', last_name: 'Smith' },
  },
  {
    id: 'class-2',
    name: 'Year 2B',
    year_group: '2',
    room_number: null,
    academic_year: null,
    active: false,
    teacher: null,
  },
]

describe('ClassesTable', () => {
  it('renders class names', () => {
    render(<ClassesTable classes={mockClasses} canEdit={false} />)
    expect(screen.getByText('Year 1A')).toBeTruthy()
    expect(screen.getByText('Year 2B')).toBeTruthy()
  })

  it('renders teacher name', () => {
    render(<ClassesTable classes={mockClasses} canEdit={false} />)
    // Appears in both mobile secondary and desktop column
    expect(screen.getAllByText('Smith, Jane').length).toBeGreaterThan(0)
  })

  it('renders active status badge', () => {
    render(<ClassesTable classes={mockClasses} canEdit={false} />)
    // StatusBadge renders in both mobile secondary and desktop status column
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
  })

  it('renders inactive status badge', () => {
    render(<ClassesTable classes={mockClasses} canEdit={false} />)
    expect(screen.getAllByText('Inactive').length).toBeGreaterThan(0)
  })

  it('shows Details links for all classes (mobile secondary + desktop)', () => {
    render(<ClassesTable classes={mockClasses} canEdit={false} />)
    // Each class has a Details link in both the mobile secondary cell and desktop actions cell
    const detailsLinks = screen.getAllByRole('link', { name: 'Details' })
    expect(detailsLinks).toHaveLength(4)
    expect(detailsLinks[0].getAttribute('href')).toBe('/portal/classes/class-1')
    expect(detailsLinks[2].getAttribute('href')).toBe('/portal/classes/class-2')
  })

  it('does not show Edit links when canEdit is false', () => {
    render(<ClassesTable classes={mockClasses} canEdit={false} />)
    expect(screen.queryByRole('link', { name: 'Edit' })).toBeNull()
  })

  it('shows Edit links when canEdit is true', () => {
    render(<ClassesTable classes={mockClasses} canEdit={true} />)
    const editLinks = screen.getAllByRole('link', { name: 'Edit' })
    // Each class has an Edit link in both the mobile name cell and desktop actions cell
    expect(editLinks).toHaveLength(4)
    expect(editLinks[0].getAttribute('href')).toBe(
      '/portal/classes/class-1/edit',
    )
    expect(editLinks[2].getAttribute('href')).toBe(
      '/portal/classes/class-2/edit',
    )
  })

  it('shows dash when no teacher assigned', () => {
    render(<ClassesTable classes={mockClasses} canEdit={false} />)
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('renders empty table when no classes provided', () => {
    render(<ClassesTable classes={[]} canEdit={false} />)
    expect(screen.queryByRole('link', { name: 'Details' })).toBeNull()
  })
})
