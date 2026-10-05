import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { AccordionGroup } from './AccordionGroup'
import { AccordionItem } from './AccordionItem'

const renderItems = (): ReturnType<typeof render> =>
  render(
    <AccordionGroup ids={['faq-hours', 'faq-term-dates']}>
      <AccordionItem id="faq-hours" title="Operating Hours">
        <p>Saturday 9:30 to 13:00</p>
      </AccordionItem>
      <AccordionItem id="faq-term-dates" title="Term Dates">
        <p>Autumn term starts in September</p>
      </AccordionItem>
    </AccordionGroup>,
  )

const button = (name: string): HTMLElement =>
  screen.getByRole('button', { name })

describe('AccordionItem', (): void => {
  it('renders its title closed by default with no panel', (): void => {
    renderItems()

    expect(button('Term Dates')).toHaveAttribute('aria-expanded', 'false')
    expect(button('Term Dates')).not.toHaveAttribute('aria-controls')
    expect(
      screen.queryByText('Autumn term starts in September'),
    ).not.toBeInTheDocument()
  })

  it('exposes its id so it can be targeted by a URL hash', (): void => {
    const { container } = renderItems()

    expect(container.querySelector('[id="faq-term-dates"]')).not.toBeNull()
  })

  it('opens when its title is clicked and links the button to the panel', (): void => {
    renderItems()

    fireEvent.click(button('Term Dates'))

    expect(button('Term Dates')).toHaveAttribute('aria-expanded', 'true')
    expect(button('Term Dates')).toHaveAttribute('data-open')
    expect(button('Term Dates')).toHaveAttribute(
      'aria-controls',
      'faq-term-dates-panel',
    )
    expect(
      screen.getByText('Autumn term starts in September').closest('dd'),
    ).toHaveAttribute('id', 'faq-term-dates-panel')
  })

  it('closes when its title is clicked again', (): void => {
    renderItems()

    fireEvent.click(button('Term Dates'))
    fireEvent.click(button('Term Dates'))

    expect(button('Term Dates')).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the other item when opened', (): void => {
    renderItems()

    fireEvent.click(button('Operating Hours'))
    fireEvent.click(button('Term Dates'))

    expect(button('Operating Hours')).toHaveAttribute('aria-expanded', 'false')
    expect(button('Term Dates')).toHaveAttribute('aria-expanded', 'true')
  })
})
