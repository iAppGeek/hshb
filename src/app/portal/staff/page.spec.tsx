import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`)
  }),
}))

vi.mock('@/db', () => ({
  getAllStaffWithClasses: vi.fn(),
}))

import { auth } from '@/auth'
import { getAllStaffWithClasses } from '@/db'

import StaffPage from './page'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue({ user: { role: 'teacher' } } as any)
})

const mockStaff = [
  {
    id: 'staff-1',
    first_name: 'Jane',
    last_name: 'Smith',
    display_name: 'Jane Smith',
    role: 'teacher',
    email: 'jane@school.com',
    contact_number: '07700 900001',
    classes: [
      { id: 'class-1', name: 'Year 3A', room_number: 'R12', year_group: '3' },
    ],
  },
  {
    id: 'staff-2',
    first_name: 'Bob',
    last_name: 'Jones',
    display_name: null,
    role: 'admin',
    email: 'bob@school.com',
    contact_number: null,
    classes: [],
  },
]

describe('StaffPage', () => {
  it('redirects to login when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    await expect(StaffPage()).rejects.toThrow('NEXT_REDIRECT:/portal/login')
  })

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

  it('renders staff first/last names, display name, and roles', async () => {
    vi.mocked(getAllStaffWithClasses).mockResolvedValue(mockStaff as any)

    render(await StaffPage())
    expect(screen.getByText('Jane')).toBeTruthy()
    expect(screen.getByText('Smith')).toBeTruthy()
    expect(screen.getByText('Jane Smith')).toBeTruthy()
    expect(screen.getByText('Teacher')).toBeTruthy()
    expect(screen.getByText('Bob')).toBeTruthy()
    expect(screen.getByText('Jones')).toBeTruthy()
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
