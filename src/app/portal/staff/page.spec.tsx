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
    personal_email: 'jane@gmail.com',
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
    personal_email: null,
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

  it('renders staff first/last names, display name, roles, and emails', async () => {
    vi.mocked(getAllStaffWithClasses).mockResolvedValue(mockStaff as any)

    render(await StaffPage())
    // Full name shown in primary td; 'Jane Smith' also matches display_name column
    expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0)
    // Bob has no display_name; last name appears directly in the desktop-only column
    expect(screen.getAllByText('Jones').length).toBeGreaterThan(0)
    expect(screen.getByText('Teacher')).toBeTruthy()
    expect(screen.getByText('Admin')).toBeTruthy()
    // Email is visible to all roles
    expect(screen.getByText('Email')).toBeTruthy()
    expect(screen.getAllByText('jane@school.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText('bob@school.com').length).toBeGreaterThan(0)
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

  it('hides contact and personal email columns for teachers', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'teacher' } } as any)
    vi.mocked(getAllStaffWithClasses).mockResolvedValue(mockStaff as any)

    render(await StaffPage())
    expect(screen.queryByText('Contact')).toBeNull()
    expect(screen.queryByText('07700 900001')).toBeNull()
    expect(screen.queryByText('Personal Email')).toBeNull()
    expect(screen.queryByText('jane@gmail.com')).toBeNull()
  })

  it('shows contact and personal email columns for admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin' } } as any)
    vi.mocked(getAllStaffWithClasses).mockResolvedValue(mockStaff as any)

    render(await StaffPage())
    expect(screen.getByText('Contact')).toBeTruthy()
    expect(screen.getByText('Personal Email')).toBeTruthy()
    // Contact number appears in both mobile card and desktop column
    expect(screen.getAllByText('07700 900001').length).toBeGreaterThan(0)
    // Personal email appears in both mobile card and desktop column
    expect(screen.getAllByText('jane@gmail.com').length).toBeGreaterThan(0)
  })

  it('shows contact column for headteacher', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'headteacher' } } as any)
    vi.mocked(getAllStaffWithClasses).mockResolvedValue(mockStaff as any)

    render(await StaffPage())
    expect(screen.getByText('Contact')).toBeTruthy()
    // Contact number appears in both mobile card and desktop column
    expect(screen.getAllByText('07700 900001').length).toBeGreaterThan(0)
  })

  it('shows contact column for secretary', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'secretary' } } as any)
    vi.mocked(getAllStaffWithClasses).mockResolvedValue(mockStaff as any)

    render(await StaffPage())
    expect(screen.getByText('Contact')).toBeTruthy()
    // Contact number appears in both mobile card and desktop column
    expect(screen.getAllByText('07700 900001').length).toBeGreaterThan(0)
  })
})
