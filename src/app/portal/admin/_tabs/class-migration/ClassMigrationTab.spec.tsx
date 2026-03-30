import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/db', () => ({
  getAllClasses: vi.fn(),
  getTeachers: vi.fn(),
  getStudentsByClass: vi.fn(),
}))
vi.mock('./ClassMigrationForm', () => ({
  default: vi.fn(({ sourceClassId, students, classes, teachers, baseUrl }) => (
    <div data-testid="migration-form">
      <span data-testid="source-class-id">{sourceClassId ?? 'none'}</span>
      <span data-testid="student-count">{students.length}</span>
      <span data-testid="class-count">{classes.length}</span>
      <span data-testid="teacher-count">{teachers.length}</span>
      <span data-testid="base-url">{baseUrl}</span>
    </div>
  )),
}))
vi.mock('./actions', () => ({ migrateClassAction: vi.fn() }))

import { getAllClasses, getTeachers, getStudentsByClass } from '@/db'

import ClassMigrationForm from './ClassMigrationForm'
import ClassMigrationTab from './ClassMigrationTab'

beforeEach(() => {
  vi.clearAllMocks()
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

describe('ClassMigrationTab', () => {
  it('fetches classes and teachers and passes them to the form', async () => {
    render(await ClassMigrationTab({ sourceClassId: undefined }))

    expect(getAllClasses).toHaveBeenCalled()
    expect(getTeachers).toHaveBeenCalled()
    expect(screen.getByTestId('class-count').textContent).toBe('1')
    expect(screen.getByTestId('teacher-count').textContent).toBe('1')
  })

  it('does not fetch students when sourceClassId is undefined', async () => {
    render(await ClassMigrationTab({ sourceClassId: undefined }))

    expect(getStudentsByClass).not.toHaveBeenCalled()
    expect(screen.getByTestId('student-count').textContent).toBe('0')
    expect(screen.getByTestId('source-class-id').textContent).toBe('none')
  })

  it('fetches students when sourceClassId is provided', async () => {
    vi.mocked(getStudentsByClass).mockResolvedValue([
      { id: 's1', first_name: 'John', last_name: 'Doe' },
    ] as any)

    render(await ClassMigrationTab({ sourceClassId: 'class-1' }))

    expect(getStudentsByClass).toHaveBeenCalledWith('class-1')
    expect(screen.getByTestId('student-count').textContent).toBe('1')
  })

  it('passes the correct baseUrl to the form', async () => {
    render(await ClassMigrationTab({ sourceClassId: undefined }))

    expect(screen.getByTestId('base-url').textContent).toBe(
      '/portal/admin?tab=class-migration',
    )
  })

  it('passes mapped class and teacher shapes to form', async () => {
    render(await ClassMigrationTab({ sourceClassId: undefined }))

    expect(vi.mocked(ClassMigrationForm)).toHaveBeenCalledWith(
      expect.objectContaining({
        classes: [
          {
            id: 'class-1',
            name: 'Year 1A',
            year_group: '1',
            academic_year: '2025/26',
          },
        ],
        teachers: [
          {
            id: 'teacher-1',
            first_name: 'Alice',
            last_name: 'Smith',
            display_name: null,
          },
        ],
      }),
      undefined,
    )
  })
})
