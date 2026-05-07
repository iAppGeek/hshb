import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('next/font/google', () => ({
  Inter: () => ({ variable: '--font-inter', className: 'inter-class' }),
}))

vi.mock('@next/third-parties/google', () => ({
  GoogleAnalytics: () => null,
}))

vi.mock('@/styles/tailwind.css', () => ({}))

vi.mock('clsx', () => ({
  default: (...args: unknown[]) => args.flat().filter(Boolean).join(' '),
}))

import RootLayout, { metadata } from './layout'

describe('metadata', () => {
  it('has the correct default title', () => {
    expect((metadata.title as { default: string }).default).toBe(
      'Hellenic School of High Barnet',
    )
  })

  it('has a title template', () => {
    expect((metadata.title as { template: string }).template).toContain(
      'Hellenic School of High Barnet',
    )
  })

  it('includes the correct description', () => {
    expect(metadata.description).toContain('Hellenic School')
  })

  it('has openGraph type website', () => {
    expect((metadata.openGraph as { type?: string })?.type).toBe('website')
  })

  it('has twitter site handle', () => {
    expect(metadata.twitter?.site).toBe('@HSHBInfo')
  })

  it('includes greek school keywords', () => {
    expect(metadata.keywords).toContain('greek school london')
  })
})

describe('RootLayout', () => {
  it('renders children inside the body', () => {
    const { getByText } = render(
      <RootLayout>
        <div>page content</div>
      </RootLayout>,
    )
    expect(getByText('page content')).toBeTruthy()
  })

  it('renders html element with lang="en"', () => {
    render(
      <RootLayout>
        <div>content</div>
      </RootLayout>,
    )
    expect(document.documentElement).toHaveAttribute('lang', 'en')
  })

  it('renders body with flex class', () => {
    render(
      <RootLayout>
        <div>content</div>
      </RootLayout>,
    )
    expect(document.body).toHaveClass('flex')
  })
})
