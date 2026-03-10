import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/db', () => ({
  getAllStudents: vi.fn(),
  getStudentsByClass: vi.fn(),
  getClassesByTeacher: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

import { auth } from '@/auth'
import { getAllStudents, getStudentsByClass, getClassesByTeacher } from '@/db'

import StudentsPage from './page'

beforeEach(() => {
  vi.clearAllMocks()
})

const mockStudent = {
  id: 'student-1',
  student_code: 'STU-001',
  first_name: 'Nikos',
  last_name: 'Papadopoulos',
  student_classes: [
    { class: { id: 'class-1', name: 'Year 3A', year_group: '3' } },
  ],
  primary_guardian: {
    first_name: 'Maria',
    last_name: 'Papadopoulos',
    phone: '07700 900000',
    email: null,
    address_line_1: null,
    address_line_2: null,
    city: null,
    postcode: null,
    notes: null,
  },
  primary_guardian_relationship: null,
  secondary_guardian: null,
  secondary_guardian_relationship: null,
  additional_contact_1: null,
  additional_contact_1_relationship: null,
  additional_contact_2: null,
  additional_contact_2_relationship: null,
  address_line_1: null,
  address_line_2: null,
  city: null,
  postcode: null,
  allergies: null,
  notes: null,
  active: true,
}

describe('StudentsPage', () => {
  it('renders the Students heading', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllStudents).mockResolvedValue([])

    render(await StudentsPage())
    expect(screen.getByText('Students')).toBeTruthy()
  })

  it('shows Add student button for admin', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllStudents).mockResolvedValue([])

    render(await StudentsPage())
    expect(screen.getByText('Add student')).toBeTruthy()
  })

  it('hides Add student button for teacher', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-2' },
    } as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue([])
    vi.mocked(getStudentsByClass).mockResolvedValue([])

    render(await StudentsPage())
    expect(screen.queryByText('Add student')).toBeNull()
  })

  it('hides Add student button for headteacher', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'headteacher', staffId: 'staff-3' },
    } as any)
    vi.mocked(getAllStudents).mockResolvedValue([])

    render(await StudentsPage())
    expect(screen.queryByText('Add student')).toBeNull()
  })

  it('renders student rows in the table', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllStudents).mockResolvedValue([mockStudent] as any)

    render(await StudentsPage())
    expect(screen.getByText('Papadopoulos, Nikos')).toBeTruthy()
    expect(screen.getByText('STU-001')).toBeTruthy()
  })

  it('shows empty state when no students exist', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getAllStudents).mockResolvedValue([])

    render(await StudentsPage())
    expect(screen.getByText('No students found.')).toBeTruthy()
  })

  it('fetches only teacher classes and their students for teacher role', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-2' },
    } as any)
    vi.mocked(getClassesByTeacher).mockResolvedValue([{ id: 'class-1' }] as any)
    vi.mocked(getStudentsByClass).mockResolvedValue([mockStudent] as any)

    await StudentsPage()
    expect(getClassesByTeacher).toHaveBeenCalledWith('staff-2')
    expect(getStudentsByClass).toHaveBeenCalledWith('class-1')
    expect(getAllStudents).not.toHaveBeenCalled()
  })
})
