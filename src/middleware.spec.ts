import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRedirect = vi.hoisted(() => vi.fn((url: URL) => ({ redirected: true, url })))

vi.mock('@/auth', () => ({
  auth: vi.fn((handler: any) => handler),
}))

vi.mock('next/server', () => ({
  NextResponse: { redirect: mockRedirect },
}))

import middleware from './middleware'

const makeReq = (pathname: string, auth: any = null) =>
  ({
    nextUrl: { pathname },
    url: 'http://localhost:3000',
    auth,
  }) as any

beforeEach(() => {
  vi.clearAllMocks()
})

describe('middleware', () => {
  it('redirects unauthenticated user from portal to login', () => {
    middleware(makeReq('/portal/dashboard'))
    expect(mockRedirect).toHaveBeenCalledWith(
      new URL('/portal/login', 'http://localhost:3000'),
    )
  })

  it('redirects logged-in user away from login page to dashboard', () => {
    middleware(makeReq('/portal/login', { user: { role: 'teacher' } }))
    expect(mockRedirect).toHaveBeenCalledWith(
      new URL('/portal/dashboard', 'http://localhost:3000'),
    )
  })

  it('allows authenticated user to access dashboard', () => {
    middleware(makeReq('/portal/dashboard', { user: { role: 'admin' } }))
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('blocks teacher from accessing reports and redirects to dashboard', () => {
    middleware(makeReq('/portal/reports', { user: { role: 'teacher' } }))
    expect(mockRedirect).toHaveBeenCalledWith(
      new URL('/portal/dashboard', 'http://localhost:3000'),
    )
  })

  it('allows admin to access reports', () => {
    middleware(makeReq('/portal/reports', { user: { role: 'admin' } }))
    expect(mockRedirect).not.toHaveBeenCalled()
  })

  it('allows headteacher to access reports', () => {
    middleware(makeReq('/portal/reports', { user: { role: 'headteacher' } }))
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})
