import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))
vi.mock('@/images/icons/github-mark.svg', () => ({ default: '/github.svg' }))

import { Footer } from './Footer'

describe('Footer', () => {
  it('links to the policies page in a new tab', () => {
    render(<Footer />)

    const nav = screen.getByRole('navigation', { name: /policies/i })
    const link = within(nav).getByRole('link', { name: 'Policies & Privacy' })
    expect(link).toHaveAttribute('href', '/policies')
    expect(link).toHaveAttribute('target', '_blank')
  })
})
