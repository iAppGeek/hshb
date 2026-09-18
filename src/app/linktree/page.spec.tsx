import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))
vi.mock('@/images/logo.png', () => ({ default: '/logo.png' }))
vi.mock('@/images/icons/twitter.svg', () => ({ default: '/twitter.svg' }))
vi.mock('@/images/icons/facebook.svg', () => ({ default: '/facebook.svg' }))
vi.mock('@/images/icons/instagram.svg', () => ({ default: '/instagram.svg' }))
vi.mock('@/images/icons/classdojo-icon.svg', () => ({
  default: '/classdojo.svg',
}))
vi.mock('@/data/events', () => ({ sendEvent: vi.fn() }))

import LinktreePage from './page'

describe('LinktreePage', () => {
  it('CCs the staff email and shows the note when t is a valid staff local part', async () => {
    render(
      await LinktreePage({
        searchParams: Promise.resolve({ t: 'jsmith' }),
        params: Promise.resolve({}),
      }),
    )

    expect(screen.getByText(/shared by jsmith@hshb.org.uk/i)).toBeVisible()
    const emailLink = screen.getByRole('link', {
      name: /contact us/i,
    })
    expect(emailLink.getAttribute('href')).toContain('cc=jsmith%40hshb.org.uk')
  })

  it('shows no note and no cc when t is missing', async () => {
    render(
      await LinktreePage({
        searchParams: Promise.resolve({}),
        params: Promise.resolve({}),
      }),
    )

    expect(screen.queryByText(/shared by/i)).not.toBeInTheDocument()
    const emailLink = screen.getByRole('link', {
      name: /contact us/i,
    })
    expect(emailLink.getAttribute('href')).not.toContain('cc=')
  })

  it('shows no note and no cc when t is invalid', async () => {
    render(
      await LinktreePage({
        searchParams: Promise.resolve({ t: 'jsmith@evil.com' }),
        params: Promise.resolve({}),
      }),
    )

    expect(screen.queryByText(/shared by/i)).not.toBeInTheDocument()
    const emailLink = screen.getByRole('link', {
      name: /contact us/i,
    })
    expect(emailLink.getAttribute('href')).not.toContain('cc=')
  })
})
