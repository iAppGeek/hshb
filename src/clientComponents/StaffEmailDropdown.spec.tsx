import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import StaffEmailDropdown from './StaffEmailDropdown'

describe('StaffEmailDropdown', () => {
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

  it('renders disabled trigger when both groups are empty', () => {
    render(
      <StaffEmailDropdown
        teachers={{ emails: [], mailtoHref: null }}
        allStaff={{ emails: [], mailtoHref: null }}
        triggerClassName="rounded border px-2"
      />,
    )
    expect(screen.getByText('Email staff')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /email staff/i })).toBeNull()
  })

  it('copies teachers CSV from the teachers section', async () => {
    render(
      <StaffEmailDropdown
        teachers={{
          emails: ['t@school.com'],
          mailtoHref: 'mailto:?bcc=t%40school.com',
        }}
        allStaff={{
          emails: ['t@school.com', 'a@school.com'],
          mailtoHref: 'mailto:?bcc=',
        }}
        triggerClassName="text-sm"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /email staff/i }))
    await screen.findByRole('menu')
    const copyItems = screen.getAllByRole('menuitem', {
      name: /^copy emails \(csv\)$/i,
    })
    expect(copyItems.length).toBe(2)
    fireEvent.click(copyItems[0]!)

    await waitFor(() => {
      expect(clipboardWriteText).toHaveBeenCalledWith('t@school.com')
    })
  })

  it('exposes mailto for all staff when href is set', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    const href = 'mailto:?bcc=all%40x.com'

    render(
      <StaffEmailDropdown
        teachers={{ emails: ['t@x.com'], mailtoHref: 'mailto:?bcc=t' }}
        allStaff={{ emails: ['all@x.com'], mailtoHref: href }}
        triggerClassName="text-sm"
      />,
    )

    await user.click(screen.getByRole('button', { name: /email staff/i }))
    const openItems = screen.getAllByRole('menuitem', {
      name: /open in default email app/i,
    })
    expect(openItems.length).toBe(2)
    expect(openItems[1]!.getAttribute('href')).toBe(href)
  })
})
