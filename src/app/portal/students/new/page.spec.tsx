import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getAllClasses, getAllGuardians } from '@/db'

import AddStudentPage from './page'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/db', () => ({
  getAllClasses: vi.fn(),
  getAllGuardians: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('./AddStudentForm', () => ({
  default: ({ classes }: { classes: { id: string; name: string }[] }) => (
    <div data-testid="add-student-form">
      {classes.map((c) => (
        <span key={c.id}>{c.name}</span>
      ))}
    </div>
  ),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

const mockClasses = [
  { id: 'class-1', name: 'Year 1A', year_group: '1' },
  { id: 'class-2', name: 'Year 2B', year_group: '2' },
]

describe('AddStudentPage', () => {
  it('renders the Add Student heading for admin', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllClasses).mockResolvedValue(mockClasses as any)
    vi.mocked(getAllGuardians).mockResolvedValue([])

    render(await AddStudentPage())
    expect(screen.getByText('Add Student')).toBeTruthy()
  })

  it('passes classes to the form', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllClasses).mockResolvedValue(mockClasses as any)
    vi.mocked(getAllGuardians).mockResolvedValue([])

    render(await AddStudentPage())
    expect(screen.getByText('Year 1A')).toBeTruthy()
    expect(screen.getByText('Year 2B')).toBeTruthy()
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

  it('renders the form for headteacher', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'headteacher', staffId: 'staff-3' },
    } as any)
    vi.mocked(getAllClasses).mockResolvedValue([])
    vi.mocked(getAllGuardians).mockResolvedValue([])

    render(await AddStudentPage())
    expect(screen.getByTestId('add-student-form')).toBeTruthy()
  })
})
