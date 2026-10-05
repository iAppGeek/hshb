import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { AboutUsAcordian } from './AboutUsAcordian'

vi.mock(
  'next-mdx-remote/rsc',
  (): { MDXRemote: (props: { source: string }) => React.JSX.Element } => ({
    MDXRemote: ({ source }: { source: string }): React.JSX.Element => (
      <p>{source}</p>
    ),
  }),
)

const DATA = [
  { id: 'faq-operating-hours', title: 'Operating Hours', body: 'Saturdays' },
  { id: 'faq-term-dates', title: 'Term Dates', body: 'Autumn Term 1' },
]

describe('AboutUsAcordian', (): void => {
  it('renders the heading and one linkable item per entry', (): void => {
    const { container } = render(<AboutUsAcordian data={DATA} />)

    expect(
      screen.getByRole('heading', { name: 'Want to know more?' }),
    ).toBeInTheDocument()
    expect(
      Array.from(container.querySelectorAll('dl > div[id]')).map(
        (el): string => el.id,
      ),
    ).toEqual(['faq-operating-hours', 'faq-term-dates'])
  })

  it('renders an entry body when its item is opened', (): void => {
    render(<AboutUsAcordian data={DATA} />)

    fireEvent.click(screen.getByRole('button', { name: 'Term Dates' }))

    expect(screen.getByText('Autumn Term 1')).toBeInTheDocument()
  })
})
