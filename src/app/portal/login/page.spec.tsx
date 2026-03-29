import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { render, screen } from '@testing-library/react'

import LoginPage from './page'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

vi.mock('@/images/logo.png', () => ({ default: '/logo.png' }))
vi.mock('@/images/icons/microsoft.svg', () => ({ default: '/microsoft.svg' }))

let authMock: Mock
let redirectMock: Mock

beforeEach(async () => {
  vi.clearAllMocks()
  const { auth } = await import('@/auth')
  const { redirect } = await import('next/navigation')
  authMock = auth as unknown as Mock
  redirectMock = redirect as unknown as Mock
  authMock.mockResolvedValue(null)
})

describe('LoginPage', () => {
  it('redirects to dashboard when authenticated', async () => {
    authMock.mockResolvedValue({
      user: { name: 'Test User', role: 'teacher', staffId: 1 },
      expires: '',
    })

    await LoginPage({ searchParams: Promise.resolve({}) })

    expect(redirectMock).toHaveBeenCalledWith('/portal/dashboard')
  })

  it('renders the sign in button when unauthenticated', async () => {
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

  it('does not render test login form when E2E_TEST is unset (production)', async () => {
    vi.stubEnv('E2E_TEST', '')
    render(await LoginPage({ searchParams: Promise.resolve({}) }))
    expect(screen.queryByTestId('test-login-form')).toBeNull()
    vi.unstubAllEnvs()
  })

  it('does not render test login form when E2E_TEST is not "true"', async () => {
    vi.stubEnv('E2E_TEST', 'false')
    render(await LoginPage({ searchParams: Promise.resolve({}) }))
    expect(screen.queryByTestId('test-login-form')).toBeNull()
    vi.unstubAllEnvs()
  })

  it('renders test login form when E2E_TEST is "true"', async () => {
    vi.stubEnv('E2E_TEST', 'true')
    render(await LoginPage({ searchParams: Promise.resolve({}) }))
    expect(screen.getByTestId('test-login-form')).toBeTruthy()
    vi.unstubAllEnvs()
  })
})
