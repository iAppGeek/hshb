import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

vi.mock('./actions', () => ({
  signInAction: vi.fn(),
  signOutAction: vi.fn(),
}))

import StaffAttendanceTable from './StaffAttendanceTable'
import { signInAction, signOutAction } from './actions'

beforeEach(() => {
  vi.clearAllMocks()
})

const staffA = {
  id: 'staff-1',
  first_name: 'Jane',
  last_name: 'Smith',
  display_name: null,
  class_name: 'Year 3A',
  room_number: '12',
}

const staffB = {
  id: 'staff-2',
  first_name: 'Bob',
  last_name: 'Jones',
  display_name: 'BJ',
  class_name: null,
  room_number: null,
}

const signedInRecord = {
  id: 'sa-1',
  staff_id: 'staff-1',
  date: '2026-03-18',
  signed_in_at: '2026-03-18T09:00:00Z',
  signed_out_at: null,
  created_at: null,
  updated_at: null,
}

const signedOutRecord = {
  ...signedInRecord,
  signed_out_at: '2026-03-18T17:00:00Z',
}

describe('StaffAttendanceTable', () => {
  it('renders staff names, class and room', () => {
    render(
      <StaffAttendanceTable
        rows={[
          { staff: staffA, record: null },
          { staff: staffB, record: null },
        ]}
        defaultTime="09:00"
        date="2026-03-18"
        role="admin"
        currentStaffId="admin-1"
      />,
    )

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('BJ')).toBeInTheDocument()
    expect(screen.getByText('Year 3A')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('shows Sign In button for staff with no record', () => {
    render(
      <StaffAttendanceTable
        rows={[{ staff: staffA, record: null }]}
        defaultTime="09:00"
        date="2026-03-18"
        role="admin"
        currentStaffId="admin-1"
      />,
    )

    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('shows Sign Out button and Signed In badge for currently signed-in staff', () => {
    render(
      <StaffAttendanceTable
        rows={[{ staff: staffA, record: signedInRecord }]}
        defaultTime="09:00"
        date="2026-03-18"
        role="admin"
        currentStaffId="admin-1"
      />,
    )

    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument()
    expect(screen.getAllByText(/Signed In/).length).toBeGreaterThan(0)
  })

  it('shows Sign In button for staff who have signed out (re-sign-in)', () => {
    render(
      <StaffAttendanceTable
        rows={[{ staff: staffA, record: signedOutRecord }]}
        defaultTime="09:00"
        date="2026-03-18"
        role="admin"
        currentStaffId="admin-1"
      />,
    )

    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getAllByText(/Out/).length).toBeGreaterThan(0)
  })

  it('calls signInAction on sign in form submit', async () => {
    vi.mocked(signInAction).mockResolvedValue(undefined)

    render(
      <StaffAttendanceTable
        rows={[{ staff: staffA, record: null }]}
        defaultTime="09:00"
        date="2026-03-18"
        role="admin"
        currentStaffId="admin-1"
      />,
    )

    await act(async () => {
      fireEvent.submit(
        screen.getByRole('button', { name: 'Sign In' }).closest('form')!,
      )
    })

    expect(signInAction).toHaveBeenCalled()
  })

  it('calls signOutAction on sign out form submit', async () => {
    vi.mocked(signOutAction).mockResolvedValue(undefined)

    render(
      <StaffAttendanceTable
        rows={[{ staff: staffA, record: signedInRecord }]}
        defaultTime="09:00"
        date="2026-03-18"
        role="admin"
        currentStaffId="admin-1"
      />,
    )

    await act(async () => {
      fireEvent.submit(
        screen.getByRole('button', { name: 'Sign Out' }).closest('form')!,
      )
    })

    expect(signOutAction).toHaveBeenCalled()
  })

  it('displays error message when signInAction returns an error', async () => {
    vi.mocked(signInAction).mockResolvedValue({ error: 'Not authorised' })

    render(
      <StaffAttendanceTable
        rows={[{ staff: staffA, record: null }]}
        defaultTime="09:00"
        date="2026-03-18"
        role="admin"
        currentStaffId="admin-1"
      />,
    )

    await act(async () => {
      fireEvent.submit(
        screen.getByRole('button', { name: 'Sign In' }).closest('form')!,
      )
    })

    expect(screen.getByText('Not authorised')).toBeInTheDocument()
  })

  it('displays error message when signOutAction returns an error', async () => {
    vi.mocked(signOutAction).mockResolvedValue({
      error: 'Failed to sign out. Please try again.',
    })

    render(
      <StaffAttendanceTable
        rows={[{ staff: staffA, record: signedInRecord }]}
        defaultTime="09:00"
        date="2026-03-18"
        role="admin"
        currentStaffId="admin-1"
      />,
    )

    await act(async () => {
      fireEvent.submit(
        screen.getByRole('button', { name: 'Sign Out' }).closest('form')!,
      )
    })

    expect(
      screen.getByText('Failed to sign out. Please try again.'),
    ).toBeInTheDocument()
  })

  it('renders room and class inline in the name cell for mobile card layout', () => {
    render(
      <StaffAttendanceTable
        rows={[{ staff: staffA, record: null }]}
        defaultTime="09:00"
        date="2026-03-18"
        role="admin"
        currentStaffId="admin-1"
      />,
    )

    expect(screen.getByText('Room 12 · Year 3A')).toBeInTheDocument()
  })

  it('omits room/class inline text when both are null', () => {
    render(
      <StaffAttendanceTable
        rows={[{ staff: staffB, record: null }]}
        defaultTime="09:00"
        date="2026-03-18"
        role="admin"
        currentStaffId="admin-1"
      />,
    )

    expect(screen.queryByText(/Room \d/)).not.toBeInTheDocument()
  })

  it('renders status badge in the name cell (mobile) and in its own cell (desktop)', () => {
    render(
      <StaffAttendanceTable
        rows={[{ staff: staffA, record: signedInRecord }]}
        defaultTime="09:00"
        date="2026-03-18"
        role="admin"
        currentStaffId="admin-1"
      />,
    )

    // StatusBadge renders in both the mobile name cell and the hidden desktop cell
    expect(screen.getAllByText(/Signed In/)).toHaveLength(2)
  })

  it('allows secretary to interact with own row (sign in)', async () => {
    vi.mocked(signInAction).mockResolvedValue(undefined)

    render(
      <StaffAttendanceTable
        rows={[
          { staff: staffA, record: null },
          { staff: staffB, record: null },
        ]}
        defaultTime="09:00"
        date="2026-03-18"
        role="secretary"
        currentStaffId="staff-1"
      />,
    )

    // staffA is current user (secretary) — should have a Sign In button
    const signInButtons = screen.getAllByRole('button', { name: 'Sign In' })
    expect(signInButtons).toHaveLength(1)

    await act(async () => {
      fireEvent.submit(signInButtons[0].closest('form')!)
    })

    expect(signInAction).toHaveBeenCalled()
  })

  it('disables interaction for secretary on other staff rows', () => {
    render(
      <StaffAttendanceTable
        rows={[
          { staff: staffA, record: null },
          { staff: staffB, record: null },
        ]}
        defaultTime="09:00"
        date="2026-03-18"
        role="secretary"
        currentStaffId="staff-1"
      />,
    )

    // Only one Sign In button (for secretary's own row), other row shows disabled state
    const signInButtons = screen.getAllByRole('button', { name: 'Sign In' })
    expect(signInButtons).toHaveLength(1)

    // The disabled row renders tooltip text instead of a form
    expect(
      screen.getByText('You can only sign yourself in/out'),
    ).toBeInTheDocument()
  })
})
