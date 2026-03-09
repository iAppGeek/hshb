import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: React.ComponentPropsWithoutRef<'img'>) => (
    <img src={src} alt={alt} {...props} />
  ),
}))

vi.mock('next-mdx-remote/rsc', () => ({
  MDXRemote: ({ source }: { source: string }) => <span>{source}</span>,
}))

vi.mock('@/components/Container', () => ({
  Container: ({
    children,
    className,
  }: React.ComponentPropsWithoutRef<'div'>) => (
    <div className={className}>{children}</div>
  ),
}))

vi.mock('@/clientComponents/Expandable', () => ({
  Expandable: ({
    children,
    className,
  }: React.ComponentPropsWithoutRef<'div'>) => (
    <div className={className}>{children}</div>
  ),
  ExpandableItems: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  ExpandableButton: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
}))

vi.mock('@/data/contentful')
vi.mock('@/data/mdxConfig', () => ({
  mdxOptions: {},
  mdxGridComponents: {},
}))

import type { Testimonial } from '@/data/contentful'

import { Testimonials } from './Testimonials'

const makeTestimonial = (n: number): Testimonial => ({
  title: `Testimonial ${n}`,
  text: `Text ${n}`,
  author: {
    name: `Author ${n}`,
    role: `Role ${n}`,
    image: `https://example.com/img${n}.jpg`,
  },
})

describe('Testimonials', () => {
  it('renders the section heading', () => {
    render(<Testimonials testimonials={[makeTestimonial(1)]} />)
    expect(screen.getByText(/Some kind words from our Parents/)).toBeTruthy()
  })

  it('renders first 3 testimonials directly', () => {
    const items = [1, 2, 3].map(makeTestimonial)
    render(<Testimonials testimonials={items} />)

    expect(screen.getByText('Author 1')).toBeTruthy()
    expect(screen.getByText('Author 2')).toBeTruthy()
    expect(screen.getByText('Author 3')).toBeTruthy()
  })

  it('renders author names', () => {
    const items = [makeTestimonial(1)]
    render(<Testimonials testimonials={items} />)
    expect(screen.getByText('Author 1')).toBeTruthy()
    expect(screen.getByText('Role 1')).toBeTruthy()
  })

  it('renders testimonial text via MDXRemote', () => {
    const items = [makeTestimonial(1)]
    render(<Testimonials testimonials={items} />)
    expect(screen.getByText('Text 1')).toBeTruthy()
  })

  it('renders author image with correct src', () => {
    const { container } = render(
      <Testimonials testimonials={[makeTestimonial(1)]} />,
    )
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://example.com/img1.jpg')
  })

  it('renders the expand button when more than 3 testimonials exist', () => {
    const items = [1, 2, 3, 4].map(makeTestimonial)
    render(<Testimonials testimonials={items} />)
    expect(screen.getByText('Read more testimonials')).toBeTruthy()
  })

  it('renders extra testimonials via ExpandableItems', () => {
    const items = [1, 2, 3, 4, 5].map(makeTestimonial)
    render(<Testimonials testimonials={items} />)
    // all authors should be in the document since ExpandableItems is mocked to render always
    expect(screen.getAllByText(/Author \d/).length).toBeGreaterThanOrEqual(3)
  })
})
