import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import ClassMigrationLoading from './loading'

describe('ClassMigrationLoading', () => {
  it('renders with skeleton animation', () => {
    const { container } = render(<ClassMigrationLoading />)
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders source class and new class detail sections', () => {
    const { container } = render(<ClassMigrationLoading />)
    const sections = container.querySelectorAll('.rounded-xl.bg-white')
    expect(sections.length).toBe(2)
  })
})
