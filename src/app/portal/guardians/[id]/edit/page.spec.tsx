import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getGuardianById, getStudentsByGuardian } from '@/db'

import EditGuardianPage from './page'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/db', () => ({
  getGuardianById: vi.fn(),
  getStudentsByGuardian: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('./EditGuardianForm', () => ({
  default: ({
    guardian,
  }: {
    guardian: { first_name: string; last_name: string }
  }) => (
    <div data-testid="edit-guardian-form">
      {guardian.last_name}, {guardian.first_name}
    </div>
  ),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

const mockGuardian = {
  id: 'guardian-1',
  first_name: 'Maria',
  last_name: 'Smith',
  phone: '07700 900000',
  email: 'maria@example.com',
  address_line_1: null,
  address_line_2: null,
  city: null,
  postcode: null,
  notes: null,
}

describe('EditGuardianPage', () => {
  it('renders the edit form for admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin' } } as any)
    vi.mocked(getGuardianById).mockResolvedValue(mockGuardian as any)
    vi.mocked(getStudentsByGuardian).mockResolvedValue([])

    render(
      await EditGuardianPage({ params: Promise.resolve({ id: 'guardian-1' }) }),
    )
    expect(screen.getByTestId('edit-guardian-form')).toBeTruthy()
  })

  it('redirects teacher to students list', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'teacher' } } as any)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      EditGuardianPage({ params: Promise.resolve({ id: 'guardian-1' }) }),
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/portal/students')
  })

  it('redirects headteacher to students list', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'headteacher' } } as any)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      EditGuardianPage({ params: Promise.resolve({ id: 'guardian-1' }) }),
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/portal/students')
  })

  it('redirects to students list when guardian not found', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin' } } as any)
    vi.mocked(getGuardianById).mockResolvedValue(null)
    vi.mocked(getStudentsByGuardian).mockResolvedValue([])
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      EditGuardianPage({ params: Promise.resolve({ id: 'missing-id' }) }),
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/portal/students')
  })
})
