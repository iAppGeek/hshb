import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('@/data/events', () => ({
  sendEvent: vi.fn(),
}))

import { ContactForm } from './ContactForm'
import { sendEvent } from '@/data/events'

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ContactForm', () => {
  it('renders all form fields', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText('First name')).toBeTruthy()
    expect(screen.getByLabelText('Last name')).toBeTruthy()
    expect(screen.getByLabelText('Email')).toBeTruthy()
    expect(screen.getByLabelText('Phone number')).toBeTruthy()
    expect(screen.getByLabelText('Message')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Send message' })).toBeTruthy()
  })

  it('shows success state when form submits with 200 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 200, statusText: 'OK' }),
    )

    render(<ContactForm />)
    fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('Submitted!')).toBeTruthy()
    })

    expect(sendEvent).toHaveBeenCalledWith(
      'click',
      'contact-form-submit-success',
      expect.anything(),
    )
  })

  it('shows error state when fetch returns non-200 status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 500, statusText: 'Internal Server Error' }),
    )

    render(<ContactForm />)
    fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('500 Internal Server Error')).toBeTruthy()
    })

    expect(sendEvent).toHaveBeenCalledWith(
      'click',
      'contact-form-submit-error',
      expect.anything(),
    )
  })

  it('shows error state when fetch throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    )

    render(<ContactForm />)
    fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form')!)

    await waitFor(() => {
      expect(screen.getByText(/Error: Network error/)).toBeTruthy()
    })
  })

  it('sends a submit event when form is submitted', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 200, statusText: 'OK' }),
    )

    render(<ContactForm />)
    fireEvent.submit(screen.getByRole('button', { name: 'Send message' }).closest('form')!)

    await waitFor(() => {
      expect(sendEvent).toHaveBeenCalledWith(
        'click',
        'contact-form-submit',
        expect.anything(),
      )
    })
  })
})
