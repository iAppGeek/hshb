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

const sampleIncident = {
  id: 'inc-1',
  type: 'medical' as const,
  title: 'Playground fall',
  description: 'Student fell on playground',
  incident_date: '2026-03-18',
  parent_notified: false,
  parent_notified_at: null,
  student: { first_name: 'Anna', last_name: 'Papadopoulos' },
  creator: { first_name: 'Jane', last_name: 'Smith' },
  updater: null,
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

  it('does not show teacher notice for secretary role', () => {
    render(<IncidentsClient {...baseProps} role="secretary" />)
    expect(
      screen.queryByText(
        'You can only view and record incidents for students in your class.',
      ),
    ).toBeNull()
  })

  it('renders all incidents for secretary (sees all data)', () => {
    render(
      <IncidentsClient
        {...baseProps}
        incidents={[sampleIncident] as any}
        role="secretary"
      />,
    )
    // Rendered in both mobile card and desktop table
    expect(screen.getAllByText('Playground fall').length).toBeGreaterThan(0)
  })

  it('shows disabled edit text with tooltip for secretary (canEdit false)', () => {
    render(
      <IncidentsClient
        {...baseProps}
        incidents={[sampleIncident] as any}
        role="secretary"
        canEdit={false}
      />,
    )

    // Secretary sees the disabled "Edit" text (not a link) since canEdit is false
    // and is not a teacher, so the tooltip branch renders
    const editSpans = screen.getAllByText('Edit')
    editSpans.forEach((el) => {
      expect(el.tagName).not.toBe('A')
    })

    // Tooltip with permission message is rendered
    expect(
      screen.getAllByText("You don't have permission to edit incidents").length,
    ).toBeGreaterThan(0)
  })
})
