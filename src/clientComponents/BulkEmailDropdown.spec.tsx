import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import BulkEmailDropdown from './BulkEmailDropdown'

describe('BulkEmailDropdown', () => {
  let clipboardWriteText: ReturnType<typeof vi.fn>

  beforeEach(() => {
    clipboardWriteText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: clipboardWriteText },
      configurable: true,
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders disabled trigger when there are no emails', () => {
    render(
      <BulkEmailDropdown
        emails={[]}
        mailtoHref={null}
        buttonLabel="Email staff"
        triggerClassName="rounded border px-2"
      />,
    )
    expect(screen.getByText('Email staff')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /email staff/i })).toBeNull()
  })

  it('opens menu and copies CSV when choosing copy', async () => {
    render(
      <BulkEmailDropdown
        emails={['a@x.com', 'b@x.com']}
        mailtoHref="mailto:?bcc=a%40x.com%2Cb%40x.com"
        buttonLabel="Email class"
        triggerClassName="text-sm"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /email class/i }))
    await screen.findByRole('menu')
    const copyItem = screen.getByRole('menuitem', {
      name: /^copy emails \(csv\)$/i,
    })
    fireEvent.click(copyItem)

    await waitFor(() => {
      expect(clipboardWriteText).toHaveBeenCalledWith('a@x.com,b@x.com')
    })
  })

  it('renders mailto link when href is set', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const href = 'mailto:?bcc=test%40x.com'

    render(
      <BulkEmailDropdown
        emails={['test@x.com']}
        mailtoHref={href}
        buttonLabel="Email"
        triggerClassName="text-sm"
      />,
    )

    await user.click(screen.getByRole('button', { name: /^email$/i }))
    const item = await screen.findByRole('menuitem', {
      name: /open in default email app/i,
    })
    expect(item.getAttribute('href')).toBe(href)
  })
})
