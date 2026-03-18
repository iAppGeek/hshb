import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockPush = vi.fn()
const mockStartTransition = vi.fn((cb: () => void) => cb())

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useTransition: () => [false, mockStartTransition],
  }
})

import DatePicker from './DatePicker'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DatePicker', () => {
  it('renders a date input with the selected date', () => {
    const { container } = render(
      <DatePicker selectedDate="2024-03-08" basePath="/portal/reports" />,
    )
    const input = container.querySelector(
      'input[type="date"]',
    ) as HTMLInputElement
    expect(input.value).toBe('2024-03-08')
  })

  it('renders the Load button', () => {
    render(<DatePicker selectedDate="2024-03-08" basePath="/portal/reports" />)
    expect(screen.getByRole('button', { name: 'Load' })).toBeTruthy()
  })

  it('navigates to basePath with selected date on submit', () => {
    render(<DatePicker selectedDate="2024-03-08" basePath="/portal/reports" />)
    const form = screen.getByRole('button', { name: 'Load' }).closest('form')!
    fireEvent.submit(form)
    expect(mockPush).toHaveBeenCalledWith('/portal/reports?date=2024-03-08')
  })

  it('uses the correct basePath when navigating', () => {
    render(
      <DatePicker
        selectedDate="2024-03-08"
        basePath="/portal/staff-attendance"
      />,
    )
    const form = screen.getByRole('button', { name: 'Load' }).closest('form')!
    fireEvent.submit(form)
    expect(mockPush).toHaveBeenCalledWith(
      '/portal/staff-attendance?date=2024-03-08',
    )
  })
})
