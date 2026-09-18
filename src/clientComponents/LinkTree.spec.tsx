import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))
vi.mock('@/images/logo.png', () => ({ default: '/logo.png' }))
vi.mock('@/images/resources/books.png', () => ({ default: '/books.png' }))
vi.mock('@/images/icons/twitter.svg', () => ({ default: '/twitter.svg' }))
vi.mock('@/images/icons/facebook.svg', () => ({ default: '/facebook.svg' }))
vi.mock('@/images/icons/instagram.svg', () => ({ default: '/instagram.svg' }))
vi.mock('@/images/icons/classdojo-icon.svg', () => ({
  default: '/classdojo.svg',
}))

vi.mock('@/data/events', () => ({ sendEvent: vi.fn() }))
import { sendEvent } from '@/data/events'

import { LinkTree } from './LinkTree'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LinkTree', () => {
  it('renders the homepage, registration and ClassDojo family registration links', () => {
    render(<LinkTree staff={null} staffEmail={null} />)

    expect(
      screen.getByRole('link', { name: /visit website/i }),
    ).toHaveAttribute('href', '/')
    expect(
      screen.getByRole('link', { name: /register student/i }),
    ).toHaveAttribute('href', 'https://portal.hshb.org.uk/register')
    expect(
      screen.getByRole('link', { name: /classdojo family registration/i }),
    ).toHaveAttribute(
      'href',
      'https://www.classdojo.com/ul/p/addKid?target=school&schoolID=561ab2860a93dff956cace93',
    )
  })

  it('renders the links in the requested order', () => {
    render(<LinkTree staff={null} staffEmail={null} />)

    const labels = within(screen.getByRole('list'))
      .getAllByRole('link')
      .map((link) => link.textContent)
      .filter((text): text is string => Boolean(text))

    expect(labels).toEqual([
      'Visit Website',
      'Contact Us',
      'Register Student',
      'ClassDojo Family Registration',
    ])
  })

  it('renders the 4 icon-only social/utility links', () => {
    render(<LinkTree staff={null} staffEmail={null} />)
    expect(screen.getByTitle(/parent sign in/i)).toHaveAttribute(
      'href',
      'https://dojo.hshb.org.uk/',
    )
    expect(screen.getByTitle(/instagram/i)).toHaveAttribute(
      'href',
      'https://instagram.hshb.org.uk/',
    )
    expect(screen.getByTitle(/facebook/i)).toHaveAttribute(
      'href',
      'https://facebook.hshb.org.uk/',
    )
    expect(screen.getByTitle(/follow us on x/i)).toHaveAttribute(
      'href',
      'https://x.hshb.org.uk/',
    )
  })

  it('does not show the "Shared by" note without a staff email', () => {
    render(<LinkTree staff={null} staffEmail={null} />)
    expect(screen.queryByText(/shared by/i)).not.toBeInTheDocument()
  })

  it('shows the "Shared by" note and CCs the staff email in the mailto link', () => {
    render(<LinkTree staff="jsmith" staffEmail="jsmith@hshb.org.uk" />)

    expect(screen.getByText(/shared by jsmith@hshb.org.uk/i)).toBeVisible()

    const emailLink = screen.getByRole('link', { name: /contact us/i })
    expect(emailLink.getAttribute('href')).toContain('cc=jsmith%40hshb.org.uk')
  })

  it('has no cc in the mailto link without a staff email', () => {
    render(<LinkTree staff={null} staffEmail={null} />)
    const emailLink = screen.getByRole('link', { name: /contact us/i })
    expect(emailLink.getAttribute('href')).not.toContain('cc=')
  })

  it('sends a view event once on mount with the staff local part', () => {
    render(<LinkTree staff="jsmith" staffEmail="jsmith@hshb.org.uk" />)
    expect(sendEvent).toHaveBeenCalledWith('view', 'linktree-view', {
      staff: 'jsmith',
    })
    expect(sendEvent).toHaveBeenCalledTimes(1)
  })

  it('sends a view event with staff "none" when there is no param', () => {
    render(<LinkTree staff={null} staffEmail={null} />)
    expect(sendEvent).toHaveBeenCalledWith('view', 'linktree-view', {
      staff: 'none',
    })
  })

  it('sends a click event with the link id and staff on click', () => {
    render(<LinkTree staff="jsmith" staffEmail="jsmith@hshb.org.uk" />)
    vi.mocked(sendEvent).mockClear()

    fireEvent.click(screen.getByRole('link', { name: /register student/i }))

    expect(sendEvent).toHaveBeenCalledWith('click', 'linktree-link', {
      link: 'registration',
      staff: 'jsmith',
    })
  })

  it('tracks a click on the internal homepage link', () => {
    render(<LinkTree staff={null} staffEmail={null} />)
    vi.mocked(sendEvent).mockClear()

    fireEvent.click(screen.getByRole('link', { name: /visit website/i }))

    expect(sendEvent).toHaveBeenCalledWith('click', 'linktree-link', {
      link: 'homepage',
      staff: 'none',
    })
  })

  it('tracks the ClassDojo parent sign-in icon click', () => {
    render(<LinkTree staff={null} staffEmail={null} />)
    vi.mocked(sendEvent).mockClear()

    fireEvent.click(screen.getByTitle(/parent sign in/i))

    expect(sendEvent).toHaveBeenCalledWith('click', 'linktree-link', {
      link: 'dojo-parent-login',
      staff: 'none',
    })
  })

  it('tracks social link clicks', () => {
    render(<LinkTree staff={null} staffEmail={null} />)
    vi.mocked(sendEvent).mockClear()

    fireEvent.click(screen.getByTitle(/instagram/i))

    expect(sendEvent).toHaveBeenCalledWith('click', 'linktree-link', {
      link: 'instagram',
      staff: 'none',
    })
  })
})
