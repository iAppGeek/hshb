import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getAllGuardians } from '@/db'

import AddStudentPage from './page'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/db', () => ({
  getAllGuardians: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('./AddStudentForm', () => ({
  default: () => <div data-testid="add-student-form" />,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AddStudentPage', () => {
  it('renders the Add Student heading for admin', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllGuardians).mockResolvedValue([])

    render(await AddStudentPage())
    expect(screen.getByText('Add Student')).toBeTruthy()
  })

  it('renders the AddStudentForm for admin', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllGuardians).mockResolvedValue([])

    render(await AddStudentPage())
    expect(screen.getByTestId('add-student-form')).toBeTruthy()
  })

  it('redirects teacher to students list', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-2' },
    } as any)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(AddStudentPage()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/portal/students')
  })

  it('redirects headteacher to students list', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'headteacher', staffId: 'staff-3' },
    } as any)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(AddStudentPage()).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/portal/students')
  })
})
