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
  getClassById: vi.fn(),
  getTeachers: vi.fn(),
  getStudentsForList: vi.fn(),
}))

vi.mock('../../ClassForm', () => ({
  default: ({
    submitLabel,
    classData,
  }: {
    submitLabel: string
    classData?: { name: string }
  }) => (
    <div data-testid="class-form">
      {submitLabel}
      {classData && <span>{classData.name}</span>}
    </div>
  ),
}))

vi.mock('./actions', () => ({
  updateClassAction: vi.fn(),
}))

import { auth } from '@/auth'
import { getClassById, getTeachers, getStudentsForList } from '@/db'

import EditClassPage from './page'

const mockClass = {
  id: 'class-1',
  name: 'Year 1A',
  year_group: '1',
  room_number: 'R1',
  academic_year: '2024/25',
  active: true,
  teacher_id: 'staff-1',
  student_classes: [],
}

const mockTeachers = [
  { id: 'staff-1', first_name: 'Jane', last_name: 'Smith', display_name: null },
]
const mockStudents = [
  { id: 'student-1', first_name: 'Alice', last_name: 'Brown' },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('EditClassPage', () => {
  it('redirects teacher to /portal/classes', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-1' },
    } as any)

    await expect(
      EditClassPage({ params: Promise.resolve({ id: 'class-1' }) }),
    ).rejects.toThrow('NEXT_REDIRECT:/portal/classes')
  })

  it('redirects to /portal/classes when class not found', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getClassById).mockResolvedValue(null as any)
    vi.mocked(getTeachers).mockResolvedValue(mockTeachers as any)
    vi.mocked(getStudentsForList).mockResolvedValue(mockStudents as any)

    await expect(
      EditClassPage({ params: Promise.resolve({ id: 'nonexistent' }) }),
    ).rejects.toThrow('NEXT_REDIRECT:/portal/classes')
  })

  it('renders heading with class name for admin', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getClassById).mockResolvedValue(mockClass as any)
    vi.mocked(getTeachers).mockResolvedValue(mockTeachers as any)
    vi.mocked(getStudentsForList).mockResolvedValue(mockStudents as any)

    render(await EditClassPage({ params: Promise.resolve({ id: 'class-1' }) }))
    expect(screen.getByText('Edit Class: Year 1A')).toBeTruthy()
  })

  it('renders heading for headteacher', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'headteacher', staffId: 'staff-1' },
    } as any)
    vi.mocked(getClassById).mockResolvedValue(mockClass as any)
    vi.mocked(getTeachers).mockResolvedValue(mockTeachers as any)
    vi.mocked(getStudentsForList).mockResolvedValue(mockStudents as any)

    render(await EditClassPage({ params: Promise.resolve({ id: 'class-1' }) }))
    expect(screen.getByText('Edit Class: Year 1A')).toBeTruthy()
  })

  it('renders ClassForm with class data', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getClassById).mockResolvedValue(mockClass as any)
    vi.mocked(getTeachers).mockResolvedValue(mockTeachers as any)
    vi.mocked(getStudentsForList).mockResolvedValue(mockStudents as any)

    render(await EditClassPage({ params: Promise.resolve({ id: 'class-1' }) }))
    expect(screen.getByTestId('class-form')).toBeTruthy()
    expect(screen.getByText('Year 1A')).toBeTruthy()
  })

  it('fetches class, teachers and students', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'admin', staffId: 'staff-1' },
    } as any)
    vi.mocked(getClassById).mockResolvedValue(mockClass as any)
    vi.mocked(getTeachers).mockResolvedValue(mockTeachers as any)
    vi.mocked(getStudentsForList).mockResolvedValue(mockStudents as any)

    render(await EditClassPage({ params: Promise.resolve({ id: 'class-1' }) }))
    expect(getClassById).toHaveBeenCalledWith('class-1')
    expect(getTeachers).toHaveBeenCalled()
    expect(getStudentsForList).toHaveBeenCalled()
  })
})
