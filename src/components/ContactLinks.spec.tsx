import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'

vi.mock('@heroicons/react/24/outline', () => ({
  PhoneIcon: () => null,
  EnvelopeIcon: () => null,
}))

vi.mock('@/data/events', () => ({
  sendEvent: vi.fn(),
}))

import { sendEvent } from '@/data/events'

import { ContactLinks } from './ContactLinks'

const mockSendEvent = vi.mocked(sendEvent)

describe('ContactLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders phone link with correct href', () => {
    const { container } = render(
      <ContactLinks number="+44 7753 829692" email="info@hshb.org.uk" />,
    )
    const phoneLink = container.querySelector('a[href="tel:+44 7753 829692"]')
    expect(phoneLink).toBeTruthy()
  })

  it('renders email link with correct href and preset subject', () => {
    const { container } = render(
      <ContactLinks number="+44 7753 829692" email="info@hshb.org.uk" />,
    )
    const emailLink = container.querySelector(
      'a[href="mailto:info@hshb.org.uk?subject=Website%20Enquiry"]',
    )
    expect(emailLink).toBeTruthy()
  })

  it('calls sendEvent with contact-phone on phone click', () => {
    const { container } = render(
      <ContactLinks number="+44 7753 829692" email="info@hshb.org.uk" />,
    )
    const phoneLink = container.querySelector(
      'a[href="tel:+44 7753 829692"]',
    ) as HTMLElement
    fireEvent.click(phoneLink)
    expect(mockSendEvent).toHaveBeenCalledWith('click', 'contact-phone')
  })

  it('calls sendEvent with contact-email on email click', () => {
    const { container } = render(
      <ContactLinks number="+44 7753 829692" email="info@hshb.org.uk" />,
    )
    const emailLink = container.querySelector(
      'a[href="mailto:info@hshb.org.uk?subject=Website%20Enquiry"]',
    ) as HTMLElement
    fireEvent.click(emailLink)
    expect(mockSendEvent).toHaveBeenCalledWith('click', 'contact-email')
  })
})
