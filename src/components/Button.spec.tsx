import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({
    href,
    className,
    children,
    ...props
  }: React.ComponentPropsWithoutRef<'a'> & { href: string }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('clsx', () => ({
  default: (...args: unknown[]) => args.flat().filter(Boolean).join(' '),
}))

import { Button } from './Button'

describe('Button', () => {
  it('renders a <button> when no href is provided', () => {
    const { container } = render(<Button>Click me</Button>)
    expect(container.querySelector('button')).toBeTruthy()
    expect(container.querySelector('a')).toBeNull()
  })

  it('renders an <a> when href is provided', () => {
    const { container } = render(<Button href="/about">Go</Button>)
    expect(container.querySelector('a')).toBeTruthy()
    expect(container.querySelector('button')).toBeNull()
  })

  it('applies solid variant classes by default', () => {
    const { container } = render(<Button>Label</Button>)
    expect(container.firstChild).toHaveClass('inline-flex')
    expect(container.firstChild).toHaveClass('rounded-md')
  })

  it('applies outline variant classes', () => {
    const { container } = render(<Button variant="outline">Label</Button>)
    expect(container.firstChild).toHaveClass('border')
  })

  it('applies blue color classes', () => {
    const { container } = render(<Button color="blue">Label</Button>)
    expect(container.firstChild).toHaveClass('bg-blue-600')
  })

  it('applies white color classes', () => {
    const { container } = render(<Button color="white">Label</Button>)
    expect(container.firstChild).toHaveClass('bg-white')
  })

  it('merges additional className', () => {
    const { container } = render(<Button className="my-class">Label</Button>)
    expect(container.firstChild).toHaveClass('my-class')
  })

  it('passes href to the link', () => {
    const { container } = render(<Button href="/home">Home</Button>)
    expect(container.querySelector('a')).toHaveAttribute('href', '/home')
  })
})
