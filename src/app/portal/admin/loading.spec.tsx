import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import AdminLoading from './loading'

describe('AdminLoading', () => {
  it('renders with skeleton animation', () => {
    const { container } = render(<AdminLoading />)
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders tab bar and two content section skeletons', () => {
    const { container } = render(<AdminLoading />)
    const sections = container.querySelectorAll('.rounded-xl.bg-white')
    expect(sections.length).toBe(2)
  })
})
