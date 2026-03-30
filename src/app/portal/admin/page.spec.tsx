import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { redirect } from 'next/navigation'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('./_components/AdminTabBar', () => ({
  default: vi.fn(({ currentTab }) => (
    <div data-testid="tab-bar">
      <span data-testid="current-tab">{currentTab}</span>
    </div>
  )),
}))
vi.mock('./_tabs/class-migration/ClassMigrationTab', () => ({
  default: vi.fn(({ sourceClassId }) => (
    <div data-testid="class-migration-tab">
      <span data-testid="source-class-id">{sourceClassId ?? 'none'}</span>
    </div>
  )),
}))

import { auth } from '@/auth'

import AdminPage from './page'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(auth).mockResolvedValue({
    user: { role: 'admin', staffId: 'staff-1' },
  } as any)
})

describe('AdminPage', () => {
  it('redirects unauthenticated users to dashboard', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      AdminPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(redirect).toHaveBeenCalledWith('/portal/dashboard')
  })

  it('redirects teacher role to dashboard', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { role: 'teacher', staffId: 'staff-2' },
    } as any)
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      AdminPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(redirect).toHaveBeenCalledWith('/portal/dashboard')
  })

  it('renders page heading and tab bar for admin', async () => {
    render(await AdminPage({ searchParams: Promise.resolve({}) }))

    expect(screen.getByText('Admin Tasks')).toBeTruthy()
    expect(screen.getByTestId('tab-bar')).toBeTruthy()
  })

  it('defaults to class-migration tab when no tab param', async () => {
    render(await AdminPage({ searchParams: Promise.resolve({}) }))

    expect(screen.getByTestId('current-tab').textContent).toBe(
      'class-migration',
    )
    expect(screen.getByTestId('class-migration-tab')).toBeTruthy()
  })

  it('passes sourceClassId to the class-migration tab', async () => {
    render(
      await AdminPage({
        searchParams: Promise.resolve({
          tab: 'class-migration',
          sourceClassId: 'class-1',
        }),
      }),
    )

    expect(screen.getByTestId('source-class-id').textContent).toBe('class-1')
  })

  it('renders nothing for an unknown tab', async () => {
    render(
      await AdminPage({
        searchParams: Promise.resolve({ tab: 'unknown' }),
      }),
    )

    expect(screen.queryByTestId('class-migration-tab')).toBeNull()
  })
})
