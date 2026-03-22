import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useTransition: () => [false, (fn: () => void) => fn()],
  }
})

import ReportsModeSelector from './ReportsModeSelector'

beforeEach(() => {
  vi.clearAllMocks()
})

const defaultProps = {
  mode: 'day' as const,
  date: '2026-03-22',
  month: '2026-03',
  from: '2026-03-15',
  to: '2026-03-22',
}

describe('ReportsModeSelector', () => {
  it('renders three mode buttons', () => {
    render(<ReportsModeSelector {...defaultProps} />)
    expect(screen.getByText('Day')).toBeTruthy()
    expect(screen.getByText('Month')).toBeTruthy()
    expect(screen.getByText('Range')).toBeTruthy()
  })

  it('highlights the active mode button', () => {
    render(<ReportsModeSelector {...defaultProps} mode="month" />)
    const buttons = screen.getAllByRole('button', { name: /Day|Month|Range/ })
    const monthBtn = buttons.find((b) => b.textContent === 'Month')!
    expect(monthBtn.className).toContain('bg-blue-600')
    const dayBtn = buttons.find((b) => b.textContent === 'Day')!
    expect(dayBtn.className).not.toContain('bg-blue-600')
  })

  it('renders a date input in day mode', () => {
    render(<ReportsModeSelector {...defaultProps} mode="day" />)
    expect(screen.getByLabelText('Date')).toBeTruthy()
  })

  it('renders a month input in month mode', () => {
    render(<ReportsModeSelector {...defaultProps} mode="month" />)
    expect(screen.getByLabelText('Month')).toBeTruthy()
  })

  it('renders From and To inputs in range mode', () => {
    render(<ReportsModeSelector {...defaultProps} mode="range" />)
    expect(screen.getByLabelText('From')).toBeTruthy()
    expect(screen.getByLabelText('To')).toBeTruthy()
  })

  it('navigates when switching modes', async () => {
    const user = userEvent.setup()
    render(<ReportsModeSelector {...defaultProps} mode="day" />)
    await user.click(screen.getByText('Month'))
    expect(pushMock).toHaveBeenCalled()
    const url = pushMock.mock.calls[0][0] as string
    expect(url).toContain('mode=month')
  })
})
