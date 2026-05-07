import { describe, it, expect, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'

import { FontLoader } from './FontLoader'

afterEach(() => {
  document.head
    .querySelectorAll('link[data-fontloader]')
    .forEach((el) => el.remove())
})

describe('FontLoader', () => {
  it('renders nothing visible', () => {
    const { container } = render(<FontLoader />)
    expect(container.firstChild).toBeNull()
  })

  it('appends a stylesheet link to the document head after mount', async () => {
    await act(async () => {
      render(<FontLoader />)
    })

    const links = Array.from(
      document.head.querySelectorAll('link[rel="stylesheet"]'),
    )
    const fontLink = links.find((el) =>
      el.getAttribute('href')?.includes('fontshare.com'),
    )
    expect(fontLink).toBeTruthy()
  })

  it('sets the href to the Cabinet Grotesk fontshare URL', async () => {
    await act(async () => {
      render(<FontLoader />)
    })

    const links = Array.from(
      document.head.querySelectorAll('link[rel="stylesheet"]'),
    )
    const fontLink = links.find((el) =>
      el.getAttribute('href')?.includes('fontshare.com'),
    )
    expect(fontLink?.getAttribute('href')).toContain('cabinet-grotesk')
    expect(fontLink?.getAttribute('href')).toContain('display=swap')
  })
})
