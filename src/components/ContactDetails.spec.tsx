import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

vi.mock('@heroicons/react/24/outline', () => ({
  BuildingOffice2Icon: () => null,
}))

vi.mock('next-mdx-remote/rsc', () => ({
  MDXRemote: () => null,
}))

vi.mock('@/data/mdxConfig', () => ({
  mdxOptions: {},
  mdxGridComponents: {},
}))

vi.mock('@/components/ContactLinks', () => ({
  ContactLinks: ({ number, email }: { number: string; email: string }) => (
    <div data-testid="contact-links" data-number={number} data-email={email} />
  ),
}))

import { ContactDetails } from './ContactDetails'

const defaultProps = {
  text: 'Contact us',
  address: '5 Chestnut Grove, Cockfosters',
  number: '+44 7753 829692',
  email: 'info@hshb.org.uk',
}

describe('ContactDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('passes number to ContactLinks', () => {
    const { getByTestId } = render(<ContactDetails {...defaultProps} />)
    expect(getByTestId('contact-links')).toHaveAttribute(
      'data-number',
      '+44 7753 829692',
    )
  })

  it('passes email to ContactLinks', () => {
    const { getByTestId } = render(<ContactDetails {...defaultProps} />)
    expect(getByTestId('contact-links')).toHaveAttribute(
      'data-email',
      'info@hshb.org.uk',
    )
  })

  it('renders address', () => {
    const { getByText } = render(<ContactDetails {...defaultProps} />)
    expect(getByText('5 Chestnut Grove, Cockfosters')).toBeTruthy()
  })
})
