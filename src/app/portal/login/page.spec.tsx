import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/auth', () => ({
  signIn: vi.fn(),
}))

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

vi.mock('@/images/logo.png', () => ({ default: '/logo.png' }))
vi.mock('@/images/icons/microsoft.svg', () => ({ default: '/microsoft.svg' }))

import LoginPage from './page'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LoginPage', () => {
  it('renders the sign in button', async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }))
    expect(
      screen.getByRole('button', { name: /sign in with microsoft/i }),
    ).toBeTruthy()
  })

  it('renders the staff portal heading', async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }))
    expect(screen.getByText('Staff Portal')).toBeTruthy()
  })

  it('renders the school name', async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }))
    expect(screen.getByText('Hellenic School of High Barnet')).toBeTruthy()
  })

  it('shows unauthorised message when error is AccessDenied', async () => {
    render(
      await LoginPage({
        searchParams: Promise.resolve({ error: 'AccessDenied' }),
      }),
    )
    expect(screen.getByText(/not authorised for this portal/i)).toBeTruthy()
  })

  it('does not show unauthorised message without error', async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }))
    expect(screen.queryByText(/not authorised/i)).toBeNull()
  })
})
