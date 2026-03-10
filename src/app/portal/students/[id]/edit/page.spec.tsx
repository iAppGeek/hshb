import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getStudentById, getAllGuardians } from '@/db'

import EditStudentPage from './page'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/db', () => ({
  getStudentById: vi.fn(),
  getAllGuardians: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('./EditStudentForm', () => ({
  default: ({
    student,
  }: {
    student: { first_name: string; last_name: string }
  }) => (
    <div data-testid="edit-student-form">
      {student.last_name}, {student.first_name}
    </div>
  ),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

const mockStudent = {
  id: 'student-1',
  first_name: 'Anna',
  last_name: 'Papadopoulos',
  student_code: 'S001',
  student_classes: [],
  primary_guardian_id: 'guardian-1',
  primary_guardian_relationship: 'Mother',
  secondary_guardian_id: null,
  secondary_guardian_relationship: null,
  additional_contact_1_id: null,
  additional_contact_1_relationship: null,
  additional_contact_2_id: null,
  additional_contact_2_relationship: null,
  address_line_1: null,
  address_line_2: null,
  city: null,
  postcode: null,
  date_of_birth: null,
  allergies: null,
  medical_details: null,
  notes: null,
}

describe('EditStudentPage', () => {
  it('renders the edit form for admin', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin' } } as any)
    vi.mocked(getStudentById).mockResolvedValue(mockStudent as any)
    vi.mocked(getAllGuardians).mockResolvedValue([])

    render(
      await EditStudentPage({ params: Promise.resolve({ id: 'student-1' }) }),
    )
    expect(screen.getByTestId('edit-student-form')).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Edit Student/ })).toBeTruthy()
  })

  it('redirects teacher to students list', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'teacher' } } as any)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      EditStudentPage({ params: Promise.resolve({ id: 'student-1' }) }),
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/portal/students')
  })

  it('redirects headteacher to students list', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'headteacher' } } as any)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      EditStudentPage({ params: Promise.resolve({ id: 'student-1' }) }),
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/portal/students')
  })

  it('redirects to students list when student not found', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { role: 'admin' } } as any)
    vi.mocked(getStudentById).mockResolvedValue(null)
    vi.mocked(getAllGuardians).mockResolvedValue([])
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      EditStudentPage({ params: Promise.resolve({ id: 'missing-id' }) }),
    ).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/portal/students')
  })
})
