import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

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
import { sendEvent } from '@/data/events'

import { Navbar } from './Navbar'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Navbar', () => {
  describe('desktop nav click tracking', () => {
    it('fires a GA click event when a desktop nav link is clicked', () => {
      render(<Navbar />)
      const links = screen.getAllByRole('link', { name: /events/i })
      fireEvent.click(links[0])
      expect(sendEvent).toHaveBeenCalledWith('click', 'navigation', 'events')
    })

    it('fires a GA click event with "home" when the logo link is clicked', () => {
      render(<Navbar />)
      const logoLink = screen
        .getAllByRole('link')
        .find((el) => el.getAttribute('href') === '#')
      fireEvent.click(logoLink!)
      expect(sendEvent).toHaveBeenCalledWith('click', 'navigation', 'home')
    })
  })

  describe('mobile nav click tracking', () => {
    it('fires a GA click event when a mobile nav link is clicked', () => {
      render(<Navbar />)
      const menuButton = screen.getByRole('button', { name: /open main menu/i })
      fireEvent.click(menuButton)

      const mobileLinks = screen.getAllByRole('link', { name: /contact/i })
      fireEvent.click(mobileLinks[mobileLinks.length - 1])
      expect(sendEvent).toHaveBeenCalledWith('click', 'navigation', 'contact')
    })

    it('fires "home" for the mobile Home nav link', () => {
      render(<Navbar />)
      const menuButton = screen.getByRole('button', { name: /open main menu/i })
      fireEvent.click(menuButton)

      const mobileLinks = screen.getAllByRole('link', { name: /^home$/i })
      fireEvent.click(mobileLinks[mobileLinks.length - 1])
      expect(sendEvent).toHaveBeenCalledWith('click', 'navigation', 'home')
    })
  })
})
