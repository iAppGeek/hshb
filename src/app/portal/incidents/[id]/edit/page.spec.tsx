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
  getIncidentById: vi.fn(),
}))

vi.mock('./EditIncidentForm', () => ({
  default: ({ incident }: { incident: { title: string } }) => (
    <div>EditIncidentForm title={incident.title}</div>
  ),
}))

import { auth } from '@/auth'
import { getIncidentById } from '@/db'

import EditIncidentPage from './page'

const mockIncident = {
  id: 'inc-1',
  type: 'medical',
  student_id: 'student-1',
  title: 'Allergic reaction',
  description: 'Desc',
  incident_date: '2026-03-14T10:00:00Z',
  created_by: 'staff-1',
  updated_by: null,
  created_at: '2026-03-14T10:00:00Z',
  updated_at: '2026-03-14T10:00:00Z',
  student: { id: 'student-1', first_name: 'Nikos', last_name: 'Papadopoulos' },
  creator: { id: 'staff-1', first_name: 'Alice', last_name: 'Smith' },
  updater: null,
}

const params = Promise.resolve({ id: 'inc-1' })

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getIncidentById).mockResolvedValue(mockIncident as any)
})

describe('EditIncidentPage', () => {
  it('redirects to /portal/incidents for teacher role', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'teacher' } } as any)

    await expect(EditIncidentPage({ params })).rejects.toThrow(
      'NEXT_REDIRECT:/portal/incidents',
    )
  })

  it('redirects to /portal/incidents for secretary role', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'secretary' } } as any)

    await expect(EditIncidentPage({ params })).rejects.toThrow(
      'NEXT_REDIRECT:/portal/incidents',
    )
  })

  it('redirects to /portal/incidents when incident not found', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin' } } as any)
    vi.mocked(getIncidentById).mockResolvedValue(null as any)

    await expect(EditIncidentPage({ params })).rejects.toThrow(
      'NEXT_REDIRECT:/portal/incidents',
    )
  })

  it('renders heading for admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin' } } as any)

    render(await EditIncidentPage({ params }))
    expect(screen.getByText('Edit Incident')).toBeTruthy()
  })

  it('renders EditIncidentForm for admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin' } } as any)

    render(await EditIncidentPage({ params }))
    expect(
      screen.getByText('EditIncidentForm title=Allergic reaction'),
    ).toBeTruthy()
  })

  it('renders EditIncidentForm for headteacher', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'headteacher' } } as any)

    render(await EditIncidentPage({ params }))
    expect(
      screen.getByText('EditIncidentForm title=Allergic reaction'),
    ).toBeTruthy()
  })
})
