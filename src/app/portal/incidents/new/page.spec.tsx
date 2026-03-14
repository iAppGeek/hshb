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
  getStudentsForList: vi.fn(),
  getStudentsByTeacher: vi.fn(),
}))

vi.mock('./AddIncidentForm', () => ({
  default: ({ type }: { type: string }) => (
    <div>AddIncidentForm type={type}</div>
  ),
}))

import { auth } from '@/auth'
import { getStudentsForList, getStudentsByTeacher } from '@/db'

import AddIncidentPage from './page'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockStudent = {
  id: 'student-1',
  first_name: 'Nikos',
  last_name: 'Papadopoulos',
}

describe('AddIncidentPage', () => {
  it('redirects to /portal/login when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    await expect(
      AddIncidentPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow('NEXT_REDIRECT:/portal/login')
  })

  it('renders AddIncidentForm for admin with default medical type', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getStudentsForList).mockResolvedValue([mockStudent] as any)

    render(await AddIncidentPage({ searchParams: Promise.resolve({}) }))
    expect(screen.getByText('AddIncidentForm type=medical')).toBeTruthy()
  })

  it('passes behaviour type from searchParams', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getStudentsForList).mockResolvedValue([])

    render(
      await AddIncidentPage({
        searchParams: Promise.resolve({ type: 'behaviour' }),
      }),
    )
    expect(screen.getByText('AddIncidentForm type=behaviour')).toBeTruthy()
  })

  it('scopes students for teacher role', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-3' },
    } as any)
    vi.mocked(getStudentsByTeacher).mockResolvedValue([mockStudent] as any)

    await AddIncidentPage({ searchParams: Promise.resolve({}) })
    expect(getStudentsByTeacher).toHaveBeenCalledWith('staff-3')
    expect(getStudentsForList).not.toHaveBeenCalled()
  })
})
