import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { redirect } from 'next/navigation'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/db', () => ({
  getAllClasses: vi.fn(),
  getTeachers: vi.fn(),
  getStudentsByClass: vi.fn(),
}))
vi.mock('./ClassMigrationForm', () => ({
  default: vi.fn(({ sourceClassId, students, classes, teachers }) => (
    <div data-testid="migration-form">
      <span data-testid="source-class-id">{sourceClassId ?? 'none'}</span>
      <span data-testid="student-count">{students.length}</span>
      <span data-testid="class-count">{classes.length}</span>
      <span data-testid="teacher-count">{teachers.length}</span>
    </div>
  )),
}))
vi.mock('./actions', () => ({ migrateClassAction: vi.fn() }))

import { auth } from '@/auth'
import { getAllClasses, getTeachers, getStudentsByClass } from '@/db'

import ClassMigrationPage from './page'
import ClassMigrationForm from './ClassMigrationForm'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue({
    user: { role: 'admin', staffId: 'staff-1' },
  } as any)
  vi.mocked(getAllClasses).mockResolvedValue([
    {
      id: 'class-1',
      name: 'Year 1A',
      year_group: '1',
      academic_year: '2025/26',
    },
  ] as any)
  vi.mocked(getTeachers).mockResolvedValue([
    {
      id: 'teacher-1',
      first_name: 'Alice',
      last_name: 'Smith',
      display_name: null,
    },
  ] as any)
  vi.mocked(getStudentsByClass).mockResolvedValue([])
})

describe('ClassMigrationPage', () => {
  it('redirects unauthenticated users', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      ClassMigrationPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(redirect).toHaveBeenCalledWith('/portal/classes')
  })

  it('redirects teacher role', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-2' },
    } as any)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      ClassMigrationPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(redirect).toHaveBeenCalledWith('/portal/classes')
  })

  it('renders form for admin with no sourceClassId', async () => {
    render(await ClassMigrationPage({ searchParams: Promise.resolve({}) }))

    expect(screen.getByText('Class Migration')).toBeTruthy()
    expect(screen.getByTestId('migration-form')).toBeTruthy()
    expect(screen.getByTestId('source-class-id').textContent).toBe('none')
    expect(screen.getByTestId('student-count').textContent).toBe('0')
    expect(getStudentsByClass).not.toHaveBeenCalled()
  })

  it('fetches students and passes them when sourceClassId is set', async () => {
    vi.mocked(getStudentsByClass).mockResolvedValue([
      { id: 's1', first_name: 'John', last_name: 'Doe' },
    ] as any)

    render(
      await ClassMigrationPage({
        searchParams: Promise.resolve({ sourceClassId: 'class-1' }),
      }),
    )

    expect(getStudentsByClass).toHaveBeenCalledWith('class-1')
    expect(vi.mocked(ClassMigrationForm)).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceClassId: 'class-1',
        students: [{ id: 's1', first_name: 'John', last_name: 'Doe' }],
      }),
      undefined,
    )
  })

  it('passes classes and teachers to form', async () => {
    render(await ClassMigrationPage({ searchParams: Promise.resolve({}) }))

    expect(screen.getByTestId('class-count').textContent).toBe('1')
    expect(screen.getByTestId('teacher-count').textContent).toBe('1')
  })
})
