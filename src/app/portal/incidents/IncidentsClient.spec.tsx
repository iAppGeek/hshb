import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
  useSearchParams: vi.fn(() => ({ get: vi.fn(() => 'medical') })),
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string
    children: React.ReactNode
  }) => <a href={href}>{children}</a>,
}))

import IncidentsClient from './IncidentsClient'

beforeEach(() => {
  vi.clearAllMocks()
})

const baseProps = {
  incidents: [],
  staffId: 'staff-1',
  canEdit: false,
}

describe('IncidentsClient', () => {
  it('shows teacher notice for teacher role', () => {
    render(<IncidentsClient {...baseProps} role="teacher" />)
    expect(
      screen.getByText(
        'You can only view and record incidents for students in your class.',
      ),
    ).toBeTruthy()
  })

  it('does not show teacher notice for admin role', () => {
    render(<IncidentsClient {...baseProps} role="admin" />)
    expect(
      screen.queryByText(
        'You can only view and record incidents for students in your class.',
      ),
    ).toBeNull()
  })

  it('does not show teacher notice for headteacher role', () => {
    render(<IncidentsClient {...baseProps} role="headteacher" />)
    expect(
      screen.queryByText(
        'You can only view and record incidents for students in your class.',
      ),
    ).toBeNull()
  })
})
