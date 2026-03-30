import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import AdminTabBar from './AdminTabBar'

describe('AdminTabBar', () => {
  it('renders the Class Migration tab', () => {
    render(<AdminTabBar currentTab="class-migration" />)
    expect(screen.getByText('Class Migration')).toBeTruthy()
  })

  it('links to the correct href', () => {
    render(<AdminTabBar currentTab="class-migration" />)
    const link = screen.getByRole('link', { name: 'Class Migration' })
    expect(link.getAttribute('href')).toBe('/portal/admin?tab=class-migration')
  })

  it('applies active styles to the current tab', () => {
    render(<AdminTabBar currentTab="class-migration" />)
    const link = screen.getByRole('link', { name: 'Class Migration' })
    expect(link.className).toContain('bg-white')
  })

  it('applies inactive styles to non-current tabs', () => {
    render(<AdminTabBar currentTab="other-tab" />)
    const link = screen.getByRole('link', { name: 'Class Migration' })
    expect(link.className).not.toContain('bg-white')
    expect(link.className).toContain('text-gray-500')
  })
})
