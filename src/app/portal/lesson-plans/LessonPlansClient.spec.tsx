import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string
    children: React.ReactNode
  }) => <a href={href}>{children}</a>,
}))

import LessonPlansClient from './LessonPlansClient'

beforeEach(() => {
  vi.clearAllMocks()
})

const baseProps = {
  lessonPlans: [],
  canCreate: false,
  canEdit: false,
}

const samplePlan = {
  id: 'plan-1',
  class_id: 'class-1',
  lesson_date: '2026-03-21',
  description: 'Phonics lesson on blends',
  created_by: 'staff-1',
  updated_by: null,
  created_at: '2026-03-21T08:00:00Z',
  updated_at: '2026-03-21T08:00:00Z',
  class: { id: 'class-1', name: 'Year 1A', year_group: 'Year 1' },
  creator: { id: 'staff-1', first_name: 'Jane', last_name: 'Smith' },
  updater: null,
}

describe('LessonPlansClient', () => {
  it('shows teacher notice for teacher role', () => {
    render(<LessonPlansClient {...baseProps} role="teacher" />)
    expect(
      screen.getByText(
        'You can only view and create lesson plans for your class.',
      ),
    ).toBeTruthy()
  })

  it('does not show teacher notice for admin role', () => {
    render(<LessonPlansClient {...baseProps} role="admin" />)
    expect(
      screen.queryByText(
        'You can only view and create lesson plans for your class.',
      ),
    ).toBeNull()
  })

  it('does not show teacher notice for secretary role', () => {
    render(<LessonPlansClient {...baseProps} role="secretary" />)
    expect(
      screen.queryByText(
        'You can only view and create lesson plans for your class.',
      ),
    ).toBeNull()
  })

  it('shows Add lesson plan button when canCreate is true', () => {
    render(<LessonPlansClient {...baseProps} role="admin" canCreate={true} />)
    expect(screen.getByText('Add lesson plan')).toBeTruthy()
  })

  it('hides Add lesson plan button when canCreate is false', () => {
    render(
      <LessonPlansClient {...baseProps} role="secretary" canCreate={false} />,
    )
    expect(screen.queryByText('Add lesson plan')).toBeNull()
  })

  it('renders lesson plans for secretary (sees all data)', () => {
    render(
      <LessonPlansClient
        {...baseProps}
        lessonPlans={[samplePlan] as any}
        role="secretary"
      />,
    )
    expect(
      screen.getAllByText('Phonics lesson on blends').length,
    ).toBeGreaterThan(0)
  })

  it('shows disabled edit text with tooltip for secretary (canEdit false)', () => {
    render(
      <LessonPlansClient
        {...baseProps}
        lessonPlans={[samplePlan] as any}
        role="secretary"
        canEdit={false}
      />,
    )

    const editSpans = screen.getAllByText('Edit')
    editSpans.forEach((el) => {
      expect(el.tagName).not.toBe('A')
    })

    expect(
      screen.getAllByText("You don't have permission to edit lesson plans")
        .length,
    ).toBeGreaterThan(0)
  })

  it('shows empty state when no lesson plans exist', () => {
    render(<LessonPlansClient {...baseProps} role="admin" />)
    expect(screen.getByText('No lesson plans found.')).toBeTruthy()
  })

  it('shows Details button next to Edit', () => {
    render(
      <LessonPlansClient
        {...baseProps}
        lessonPlans={[samplePlan] as any}
        role="admin"
        canEdit={true}
      />,
    )

    expect(screen.getAllByText('Details').length).toBeGreaterThan(0)
  })

  it('opens details modal when clicking Details button', async () => {
    render(
      <LessonPlansClient
        {...baseProps}
        lessonPlans={[samplePlan] as any}
        role="admin"
        canEdit={true}
      />,
    )

    expect(screen.queryByText('Lesson Description')).toBeNull()

    const detailsButtons = screen.getAllByText('Details')
    await userEvent.click(detailsButtons[0])

    expect(screen.getByText('Lesson Description')).toBeTruthy()
    expect(screen.getByLabelText('Close')).toBeTruthy()
  })
})
