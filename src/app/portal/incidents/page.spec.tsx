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
  getIncidents: vi.fn(),
  getStudentIdsByTeacher: vi.fn(),
}))

vi.mock('./IncidentsClient', () => ({
  default: ({
    incidents,
    canEdit,
  }: {
    incidents: unknown[]
    canEdit: boolean
  }) => (
    <div>
      IncidentsClient count={incidents.length} canEdit={String(canEdit)}
    </div>
  ),
}))

import { auth } from '@/auth'
import { getIncidents, getStudentIdsByTeacher } from '@/db'

import IncidentsPage from './page'

beforeEach(() => {
  vi.clearAllMocks()
})

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

describe('IncidentsPage', () => {
  it('redirects to /portal/login when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    await expect(IncidentsPage()).rejects.toThrow('NEXT_REDIRECT:/portal/login')
  })

  it('renders IncidentsClient for admin with all incidents', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getIncidents).mockResolvedValue([mockIncident] as any)

    render(await IncidentsPage())
    expect(screen.getByText(/IncidentsClient/)).toBeTruthy()
    expect(screen.getByText(/canEdit=true/)).toBeTruthy()
  })

  it('renders IncidentsClient for headteacher with canEdit=true', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'headteacher', staffId: 'staff-2' },
    } as any)
    vi.mocked(getIncidents).mockResolvedValue([])

    render(await IncidentsPage())
    expect(screen.getByText(/canEdit=true/)).toBeTruthy()
  })

  it('renders IncidentsClient for teacher with canEdit=false', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-3' },
    } as any)
    vi.mocked(getStudentIdsByTeacher).mockResolvedValue(['student-1'])
    vi.mocked(getIncidents).mockResolvedValue([mockIncident] as any)

    render(await IncidentsPage())
    expect(screen.getByText(/canEdit=false/)).toBeTruthy()
  })

  it('scopes incidents to teacher students only', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-3' },
    } as any)
    vi.mocked(getStudentIdsByTeacher).mockResolvedValue(['student-1'])
    vi.mocked(getIncidents).mockResolvedValue([])

    await IncidentsPage()
    expect(getStudentIdsByTeacher).toHaveBeenCalledWith('staff-3')
    expect(getIncidents).toHaveBeenCalledWith({
      studentIds: ['student-1'],
      limit: 50,
    })
  })

  it('fetches all incidents for admin without scoping', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getIncidents).mockResolvedValue([])

    await IncidentsPage()
    expect(getIncidents).toHaveBeenCalledWith({ limit: 50 })
    expect(getStudentIdsByTeacher).not.toHaveBeenCalled()
  })

  it('renders IncidentsClient for secretary with all incidents and canEdit=false', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'secretary', staffId: 'staff-4' },
    } as any)
    vi.mocked(getIncidents).mockResolvedValue([mockIncident] as any)

    render(await IncidentsPage())
    expect(screen.getByText(/IncidentsClient/)).toBeTruthy()
    expect(screen.getByText(/canEdit=false/)).toBeTruthy()
  })

  it('fetches all incidents for secretary without scoping', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'secretary', staffId: 'staff-4' },
    } as any)
    vi.mocked(getIncidents).mockResolvedValue([])

    await IncidentsPage()
    expect(getIncidents).toHaveBeenCalledWith({ limit: 50 })
    expect(getStudentIdsByTeacher).not.toHaveBeenCalled()
  })
})
