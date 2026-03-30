import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

import ClassMigrationForm from './ClassMigrationForm'
import type {
  MigrationClass,
  MigrationTeacher,
  MigrationStudent,
} from './ClassMigrationForm'

const BASE_URL = '/portal/admin?tab=class-migration'

const mockClasses: MigrationClass[] = [
  { id: 'class-1', name: 'Year 1A', year_group: '1', academic_year: '2025/26' },
  { id: 'class-2', name: 'Year 2B', year_group: '2', academic_year: '2025/26' },
]

const mockTeachers: MigrationTeacher[] = [
  {
    id: 'teacher-1',
    first_name: 'Alice',
    last_name: 'Smith',
    display_name: null,
  },
]

const mockStudents: MigrationStudent[] = [
  { id: 'student-1', first_name: 'John', last_name: 'Doe' },
  { id: 'student-2', first_name: 'Jane', last_name: 'Roe' },
]

const mockAction = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  mockAction.mockResolvedValue(undefined)
})

describe('ClassMigrationForm', () => {
  it('renders source class dropdown with all classes', () => {
    render(
      <ClassMigrationForm
        classes={mockClasses}
        teachers={mockTeachers}
        sourceClassId={null}
        students={[]}
        action={mockAction}
        baseUrl={BASE_URL}
      />,
    )

    expect(screen.getByLabelText(/class to migrate/i)).toBeTruthy()
    expect(screen.getByText('Year 1A (2025/26)')).toBeTruthy()
    expect(screen.getByText('Year 2B (2025/26)')).toBeTruthy()
  })

  it('renders new class detail fields', () => {
    render(
      <ClassMigrationForm
        classes={mockClasses}
        teachers={mockTeachers}
        sourceClassId={null}
        students={[]}
        action={mockAction}
        baseUrl={BASE_URL}
      />,
    )

    expect(screen.getByLabelText(/class name/i)).toBeTruthy()
    expect(screen.getByLabelText(/year group/i)).toBeTruthy()
    expect(screen.getByLabelText(/academic year/i)).toBeTruthy()
    expect(screen.getByLabelText(/teacher/i)).toBeTruthy()
  })

  it('shows student list when sourceClassId is set', () => {
    render(
      <ClassMigrationForm
        classes={mockClasses}
        teachers={mockTeachers}
        sourceClassId="class-1"
        students={mockStudents}
        action={mockAction}
        baseUrl={BASE_URL}
      />,
    )

    expect(screen.getByTestId('student-list')).toBeTruthy()
    expect(screen.getByText('Doe, John')).toBeTruthy()
    expect(screen.getByText('Roe, Jane')).toBeTruthy()
  })

  it('does not show student list when no source selected', () => {
    render(
      <ClassMigrationForm
        classes={mockClasses}
        teachers={mockTeachers}
        sourceClassId={null}
        students={[]}
        action={mockAction}
        baseUrl={BASE_URL}
      />,
    )

    expect(screen.queryByTestId('student-list')).toBeNull()
  })

  it('pushes baseUrl with sourceClassId when source class selection changes', () => {
    const push = vi.fn()
    vi.mocked(useRouter).mockReturnValue({ push } as any)

    render(
      <ClassMigrationForm
        classes={mockClasses}
        teachers={mockTeachers}
        sourceClassId={null}
        students={[]}
        action={mockAction}
        baseUrl={BASE_URL}
      />,
    )

    fireEvent.change(screen.getByLabelText(/class to migrate/i), {
      target: { value: 'class-1' },
    })

    expect(push).toHaveBeenCalledWith(
      '/portal/admin?tab=class-migration&sourceClassId=class-1',
    )
  })

  it('pushes baseUrl without sourceClassId when selection is cleared', () => {
    const push = vi.fn()
    vi.mocked(useRouter).mockReturnValue({ push } as any)

    render(
      <ClassMigrationForm
        classes={mockClasses}
        teachers={mockTeachers}
        sourceClassId="class-1"
        students={mockStudents}
        action={mockAction}
        baseUrl={BASE_URL}
      />,
    )

    fireEvent.change(screen.getByLabelText(/class to migrate/i), {
      target: { value: '' },
    })

    expect(push).toHaveBeenCalledWith(BASE_URL)
  })

  it('calls action on form submit', async () => {
    render(
      <ClassMigrationForm
        classes={mockClasses}
        teachers={mockTeachers}
        sourceClassId="class-1"
        students={mockStudents}
        action={mockAction}
        baseUrl={BASE_URL}
      />,
    )

    fireEvent.submit(screen.getByText(/migrate class/i).closest('form')!)

    await vi.waitFor(() => {
      expect(mockAction).toHaveBeenCalled()
    })
  })

  it('displays error returned from action', async () => {
    mockAction.mockResolvedValue({ error: 'Source class is already inactive' })

    render(
      <ClassMigrationForm
        classes={mockClasses}
        teachers={mockTeachers}
        sourceClassId="class-1"
        students={mockStudents}
        action={mockAction}
        baseUrl={BASE_URL}
      />,
    )

    fireEvent.submit(screen.getByText(/migrate class/i).closest('form')!)

    await vi.waitFor(() => {
      expect(screen.getByText('Source class is already inactive')).toBeTruthy()
    })
  })
})
