import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/db', () => ({
  getAllStaffWithClasses: vi.fn(),
}))

import StaffPage from './page'
import { getAllStaffWithClasses } from '@/db'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockStaff = [
  {
    id: 'staff-1',
    name: 'Jane Smith',
    role: 'teacher',
    email: 'jane@school.com',
    contact_number: '07700 900001',
    classes: [{ id: 'class-1', name: 'Year 3A', room_number: 'R12', year_group: '3' }],
  },
  {
    id: 'staff-2',
    name: 'Bob Jones',
    role: 'admin',
    email: 'bob@school.com',
    contact_number: null,
    classes: [],
  },
]

describe('StaffPage', () => {
  it('renders the Staff heading', async () => {
    vi.mocked(getAllStaffWithClasses).mockResolvedValue(mockStaff as any)

    render(await StaffPage())
    expect(screen.getByText('Staff')).toBeTruthy()
  })

  it('shows empty state when no staff exist', async () => {
    vi.mocked(getAllStaffWithClasses).mockResolvedValue([])

    render(await StaffPage())
    expect(screen.getByText('No staff found.')).toBeTruthy()
  })

  it('renders staff names and roles', async () => {
    vi.mocked(getAllStaffWithClasses).mockResolvedValue(mockStaff as any)

    render(await StaffPage())
    expect(screen.getByText('Jane Smith')).toBeTruthy()
    expect(screen.getByText('Teacher')).toBeTruthy()
    expect(screen.getByText('Bob Jones')).toBeTruthy()
    expect(screen.getByText('Admin')).toBeTruthy()
  })

  it('shows class name and room number for teachers', async () => {
    vi.mocked(getAllStaffWithClasses).mockResolvedValue(mockStaff as any)

    render(await StaffPage())
    expect(screen.getByText('Year 3A')).toBeTruthy()
    expect(screen.getByText('R12')).toBeTruthy()
  })

  it('shows dash for staff with no class assigned', async () => {
    vi.mocked(getAllStaffWithClasses).mockResolvedValue(mockStaff as any)

    render(await StaffPage())
    // Bob Jones has no classes — expect em-dash placeholders in class/room columns
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })

  it('shows contact number when present', async () => {
    vi.mocked(getAllStaffWithClasses).mockResolvedValue(mockStaff as any)

    render(await StaffPage())
    expect(screen.getByText('07700 900001')).toBeTruthy()
  })
})
