import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('clsx', () => ({
  default: (...args: unknown[]) => args.flat().filter(Boolean).join(' '),
}))

import { Container } from './Container'

describe('Container', () => {
  it('renders a div', () => {
    const { container } = render(<Container>content</Container>)
    expect(container.querySelector('div')).toBeTruthy()
  })

  it('applies default sm size classes', () => {
    const { container } = render(<Container>content</Container>)
    expect(container.firstChild).toHaveClass('lg:max-w-4xl')
  })

  it('applies xs size classes', () => {
    const { container } = render(<Container size="xs">content</Container>)
    expect(container.firstChild).toHaveClass('md:max-w-2xl')
  })

  it('applies lg size classes', () => {
    const { container } = render(<Container size="lg">content</Container>)
    expect(container.firstChild).toHaveClass('lg:max-w-7xl')
  })

  it('merges custom className', () => {
    const { container } = render(
      <Container className="custom-class">content</Container>,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders children', () => {
    const { getByText } = render(<Container>hello</Container>)
    expect(getByText('hello')).toBeTruthy()
  })
})
