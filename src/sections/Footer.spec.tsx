import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))
vi.mock('@/images/icons/github-mark.svg', () => ({ default: '/github.svg' }))

import { Footer } from './Footer'

describe('Footer', () => {
  it('links to the school policies and the privacy notice', () => {
    render(<Footer />)

    const nav = screen.getByRole('navigation', { name: /policies/i })
    expect(
      within(nav).getByRole('link', { name: 'School Policies' }),
    ).toHaveAttribute('href', '/policies')
    expect(
      within(nav).getByRole('link', { name: 'Privacy Notice' }),
    ).toHaveAttribute('href', '/policies/privacy-policy')
  })
})
