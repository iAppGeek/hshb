import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

let capturedConfig: any

vi.mock('next-auth', () => ({
  default: vi.fn((config) => {
    capturedConfig = config
    return {
      handlers: { GET: vi.fn(), POST: vi.fn() },
      auth: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    }
  }),
}))

vi.mock('next-auth/providers/microsoft-entra-id', () => ({
  default: vi.fn(() => ({ id: 'microsoft-entra-id' })),
}))

vi.mock('next-auth/providers/credentials', () => ({
  default: vi.fn(() => ({ id: 'test-credentials' })),
}))

vi.mock('@/db', () => ({
  getStaffByEmail: vi.fn(),
}))

import { getStaffByEmail } from '@/db'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('NextAuth config', () => {
  it('is initialised with the microsoft-entra-id provider', async () => {
    await import('./config')
    expect(capturedConfig.providers).toHaveLength(1)
    expect(capturedConfig.providers[0].id).toBe('microsoft-entra-id')
  })

  it('sets the sign-in page to /portal/login', async () => {
    await import('./config')
    expect(capturedConfig.pages.signIn).toBe('/portal/login')
  })
})

describe('signIn callback', () => {
  beforeEach(async () => {
    await import('./config')
  })

  it('returns false when user has no email', async () => {
    const result = await capturedConfig.callbacks.signIn({ user: {} })
    expect(result).toBe(false)
  })

  it('returns true when user email exists in staff table', async () => {
    vi.mocked(getStaffByEmail).mockResolvedValue({
      id: 'staff-1',
      role: 'teacher',
    } as any)
    const result = await capturedConfig.callbacks.signIn({
      user: { email: 'teacher@school.com' },
    })
    expect(result).toBe(true)
  })

  it('returns false when user email is not in staff table', async () => {
    vi.mocked(getStaffByEmail).mockResolvedValue(null)
    const result = await capturedConfig.callbacks.signIn({
      user: { email: 'unknown@gmail.com' },
    })
    expect(result).toBe(false)
  })
})

describe('jwt callback', () => {
  beforeEach(async () => {
    await import('./config')
  })

  it('attaches role and staffId to token on first sign-in', async () => {
    vi.mocked(getStaffByEmail).mockResolvedValue({
      id: 'staff-1',
      role: 'admin',
    } as any)
    const result = await capturedConfig.callbacks.jwt({
      token: {},
      user: { email: 'admin@school.com' },
    })
    expect(result.role).toBe('admin')
    expect(result.staffId).toBe('staff-1')
  })

  it('returns token unchanged on subsequent calls (no user)', async () => {
    const token = { role: 'teacher', staffId: 'staff-2' }
    const result = await capturedConfig.callbacks.jwt({ token })
    expect(result).toEqual(token)
    expect(getStaffByEmail).not.toHaveBeenCalled()
  })
})

describe('session callback', () => {
  beforeEach(async () => {
    await import('./config')
  })

  it('adds role and staffId from token to session user', async () => {
    const session = { user: { name: 'Jane' } }
    const token = { role: 'headteacher', staffId: 'staff-3' }
    const result = await capturedConfig.callbacks.session({ session, token })
    expect(result.user.role).toBe('headteacher')
    expect(result.user.staffId).toBe('staff-3')
  })
})

describe('E2E_TEST provider guard', () => {
  // Each test resets modules so config.ts re-runs its top-level provider setup
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('only includes MicrosoftEntraID when E2E_TEST is unset (production)', async () => {
    vi.stubEnv('E2E_TEST', '')
    await import('./config')
    expect(capturedConfig.providers).toHaveLength(1)
    expect(capturedConfig.providers[0].id).toBe('microsoft-entra-id')
  })

  it('only includes MicrosoftEntraID when E2E_TEST is not "true"', async () => {
    vi.stubEnv('E2E_TEST', 'false')
    await import('./config')
    expect(capturedConfig.providers).toHaveLength(1)
    expect(capturedConfig.providers[0].id).toBe('microsoft-entra-id')
  })

  it('adds CredentialsProvider as second provider when E2E_TEST is "true"', async () => {
    vi.stubEnv('E2E_TEST', 'true')
    vi.stubEnv('E2E_TEST_SECRET', 'test-secret')
    await import('./config')
    expect(capturedConfig.providers).toHaveLength(2)
    expect(capturedConfig.providers[1].id).toBe('test-credentials')
  })
})
