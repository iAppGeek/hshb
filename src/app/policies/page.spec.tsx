import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))
vi.mock('@/images/icons/github-mark.svg', () => ({ default: '/github.svg' }))
vi.mock('@/data/contentfulClient', () => ({ contentfulClient: {} }))
vi.mock('@/data/contentful', () => ({ getPolicies: vi.fn() }))

import { getPolicies, type Policy } from '@/data/contentful'

import PoliciesPage from './page'

const makePolicy = (overrides: Partial<Policy> = {}): Policy => ({
  slug: 'school-policies',
  title: 'School Policies',
  summary: 'Safeguarding, behaviour and more',
  version: '1.0',
  publishDate: '2026-10-03',
  pdf: {
    url: 'https://assets.ctfassets.net/x/policies.pdf',
    fileName: 'policies.pdf',
    size: 507851,
  },
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PoliciesPage', () => {
  it('lists each policy with its metadata, linking to its clean PDF URL in a new tab', async () => {
    vi.mocked(getPolicies).mockResolvedValue([makePolicy()])

    render(await PoliciesPage())

    const link = within(screen.getByRole('main')).getByRole('link', {
      name: /school policies/i,
    })
    expect(link).toHaveAttribute('href', '/policies/school-policies')
    expect(link).toHaveAttribute('target', '_blank')
    expect(
      within(link).getByText('Safeguarding, behaviour and more'),
    ).toBeVisible()
    expect(
      within(link).getByText(
        'Version 1.0 · Published 3 October 2026 · PDF, 496 KB',
      ),
    ).toBeVisible()
  })

  it('omits the file size when it is unknown', async () => {
    vi.mocked(getPolicies).mockResolvedValue([
      makePolicy({
        pdf: { url: 'https://x/p.pdf', fileName: 'p.pdf', size: undefined },
      }),
    ])

    render(await PoliciesPage())

    expect(
      screen.getByText('Version 1.0 · Published 3 October 2026'),
    ).toBeVisible()
  })

  it('renders the site footer', async () => {
    vi.mocked(getPolicies).mockResolvedValue([])

    render(await PoliciesPage())

    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
