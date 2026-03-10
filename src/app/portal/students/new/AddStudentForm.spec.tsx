import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('./actions', () => ({
  createStudentAction: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

import { createStudentAction } from './actions'
import AddStudentForm from './AddStudentForm'

beforeEach(() => {
  vi.clearAllMocks()
})

const classes = [
  { id: 'class-1', name: 'Year 1A', year_group: '1' },
  { id: 'class-2', name: 'Year 2B', year_group: '2' },
]

const guardians = [
  { id: 'g-1', first_name: 'Maria', last_name: 'Smith', phone: '07700 900000' },
  { id: 'g-2', first_name: 'John', last_name: 'Doe', phone: '07700 900001' },
]

describe('AddStudentForm', () => {
  it('renders student detail fields', () => {
    render(<AddStudentForm classes={classes} guardians={[]} />)
    expect(screen.getByText('Student Details')).toBeTruthy()
    expect(screen.getAllByLabelText(/First name/).length).toBeGreaterThan(0)
  })

  it('renders class options as checkboxes', () => {
    render(<AddStudentForm classes={classes} guardians={[]} />)
    expect(screen.getByText('Year 1A (Year 1)')).toBeTruthy()
    expect(screen.getByText('Year 2B (Year 2)')).toBeTruthy()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(2)
  })

  it('renders primary guardian fields', () => {
    render(<AddStudentForm classes={classes} guardians={[]} />)
    expect(screen.getByText('Primary Guardian')).toBeTruthy()
  })

  it('does not show secondary guardian fields by default', () => {
    render(<AddStudentForm classes={classes} guardians={[]} />)
    expect(screen.queryByText('Secondary Guardian')).toBeNull()
  })

  it('shows secondary guardian fields after clicking add', () => {
    render(<AddStudentForm classes={classes} guardians={[]} />)
    fireEvent.click(screen.getByText('+ Add secondary guardian'))
    expect(screen.getByText('Secondary Guardian')).toBeTruthy()
  })

  it('hides secondary guardian section when Remove is clicked', () => {
    render(<AddStudentForm classes={classes} guardians={[]} />)
    fireEvent.click(screen.getByText('+ Add secondary guardian'))
    expect(screen.getByText('Secondary Guardian')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }))
    expect(screen.queryByText('Secondary Guardian')).toBeNull()
  })

  it('does not show additional contact section by default', () => {
    render(<AddStudentForm classes={classes} guardians={[]} />)
    expect(screen.queryByText('Additional Contact 1')).toBeNull()
  })

  it('shows additional contact 1 after clicking add', () => {
    render(<AddStudentForm classes={classes} guardians={[]} />)
    fireEvent.click(screen.getByText('+ Add additional contact'))
    expect(screen.getByText('Additional Contact 1')).toBeTruthy()
  })

  it('renders Cancel link pointing to students list', () => {
    render(<AddStudentForm classes={classes} guardians={[]} />)
    const link = screen.getByText('Cancel').closest('a')
    expect(link?.getAttribute('href')).toBe('/portal/students')
  })

  it('shows error message when action returns an error', async () => {
    vi.mocked(createStudentAction).mockResolvedValue({
      error: 'Failed to save student. Please try again.',
    })

    render(<AddStudentForm classes={classes} guardians={[]} />)

    fireEvent.submit(
      screen.getByRole('button', { name: 'Save student' }).closest('form')!,
    )

    await screen.findByText('Failed to save student. Please try again.')
  })

  it('renders the Save student submit button', () => {
    render(<AddStudentForm classes={classes} guardians={[]} />)
    expect(screen.getByRole('button', { name: 'Save student' })).toBeTruthy()
  })

  it('shows mode toggle when guardians exist', () => {
    render(<AddStudentForm classes={classes} guardians={guardians} />)
    expect(screen.getAllByLabelText('Add new').length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText('Select existing').length).toBeGreaterThan(
      0,
    )
  })

  it('does not show mode toggle when no guardians exist', () => {
    render(<AddStudentForm classes={classes} guardians={[]} />)
    expect(screen.queryByLabelText('Select existing')).toBeNull()
  })

  it('shows search input and hint when Select existing is chosen', () => {
    render(<AddStudentForm classes={classes} guardians={guardians} />)
    const [selectExisting] = screen.getAllByLabelText('Select existing')
    fireEvent.click(selectExisting)
    expect(
      screen.getAllByPlaceholderText('Type at least 5 characters…').length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText('Type at least 5 characters · top 10 results shown')
        .length,
    ).toBeGreaterThan(0)
  })

  it('does not filter until 5 characters are typed', () => {
    render(<AddStudentForm classes={classes} guardians={guardians} />)
    const [selectExisting] = screen.getAllByLabelText('Select existing')
    fireEvent.click(selectExisting)

    const [searchInput] = screen.getAllByPlaceholderText(
      'Type at least 5 characters…',
    )
    fireEvent.change(searchInput, { target: { value: 'smit' } }) // 4 chars

    expect(screen.queryByText('Smith, Maria — 07700 900000')).toBeNull()
    expect(screen.getAllByText('Keep typing…').length).toBeGreaterThan(0)
  })

  it('filters guardians once 5+ characters are typed', () => {
    render(<AddStudentForm classes={classes} guardians={guardians} />)
    const [selectExisting] = screen.getAllByLabelText('Select existing')
    fireEvent.click(selectExisting)

    const [searchInput] = screen.getAllByPlaceholderText(
      'Type at least 5 characters…',
    )
    fireEvent.change(searchInput, { target: { value: 'smith' } })

    expect(screen.getByText('Smith, Maria — 07700 900000')).toBeTruthy()
    expect(screen.queryByText('Doe, John — 07700 900001')).toBeNull()
  })

  it('shows no matches message when search finds nothing', () => {
    render(<AddStudentForm classes={classes} guardians={guardians} />)
    const [selectExisting] = screen.getAllByLabelText('Select existing')
    fireEvent.click(selectExisting)

    const [searchInput] = screen.getAllByPlaceholderText(
      'Type at least 5 characters…',
    )
    fireEvent.change(searchInput, { target: { value: 'zzzzz' } })

    expect(screen.getAllByText('No matches found').length).toBeGreaterThan(0)
  })

  it('filters by multiple tokens', () => {
    render(<AddStudentForm classes={classes} guardians={guardians} />)
    const [selectExisting] = screen.getAllByLabelText('Select existing')
    fireEvent.click(selectExisting)

    const [searchInput] = screen.getAllByPlaceholderText(
      'Type at least 5 characters…',
    )
    fireEvent.change(searchInput, { target: { value: 'maria smith' } })

    expect(screen.getByText('Smith, Maria — 07700 900000')).toBeTruthy()
    expect(screen.queryByText('Doe, John — 07700 900001')).toBeNull()
  })
})
