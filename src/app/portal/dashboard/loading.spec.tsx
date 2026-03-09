import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import DashboardLoading from './loading'

describe('DashboardLoading', () => {
  it('renders with skeleton animation', () => {
    const { container } = render(<DashboardLoading />)
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders 3 stat card skeletons matching the dashboard layout', () => {
    const { container } = render(<DashboardLoading />)
    // Each card: icon placeholder + label + value
    const cards = container.querySelectorAll('.rounded-xl')
    expect(cards.length).toBe(3)
  })

  it('renders a heading skeleton above the stat cards', () => {
    const { container } = render(<DashboardLoading />)
    const headingSkeleton = container.querySelector('.h-8.w-48')
    expect(headingSkeleton).toBeTruthy()
  })
})
