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
  getStaffById: vi.fn(),
}))

vi.mock('./EditStaffForm', () => ({
  default: ({
    staff,
  }: {
    staff: { first_name: string; last_name: string }
  }) => (
    <div>
      EditStaffForm:{staff.last_name},{staff.first_name}
    </div>
  ),
}))

import { auth } from '@/auth'
import { getStaffById } from '@/db'

import EditStaffPage from './page'

const mockStaff = {
  id: 'staff-1',
  first_name: 'Alice',
  last_name: 'Smith',
  email: 'alice@school.com',
  role: 'teacher',
  display_name: null,
  contact_number: null,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getStaffById).mockResolvedValue(mockStaff as any)
})

const params = Promise.resolve({ id: 'staff-1' })

describe('EditStaffPage', () => {
  it('redirects to /portal/staff for non-admin roles', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'teacher' } } as any)

    await expect(EditStaffPage({ params })).rejects.toThrow(
      'NEXT_REDIRECT:/portal/staff',
    )
  })

  it('redirects to /portal/staff for secretary role', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'secretary' } } as any)

    await expect(EditStaffPage({ params })).rejects.toThrow(
      'NEXT_REDIRECT:/portal/staff',
    )
  })

  it('redirects to /portal/staff when staff not found', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin' } } as any)
    vi.mocked(getStaffById).mockResolvedValue(null as any)

    await expect(EditStaffPage({ params })).rejects.toThrow(
      'NEXT_REDIRECT:/portal/staff',
    )
  })

  it('renders heading with staff name for admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin' } } as any)

    render(await EditStaffPage({ params }))
    expect(screen.getByText('Edit Staff: Smith, Alice')).toBeTruthy()
  })

  it('renders EditStaffForm for admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin' } } as any)

    render(await EditStaffPage({ params }))
    expect(screen.getByText('EditStaffForm:Smith,Alice')).toBeTruthy()
  })
})
