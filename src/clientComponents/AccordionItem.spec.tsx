import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'

import { AccordionItem } from './AccordionItem'

const renderItem = (): void => {
  render(
    <dl>
      <AccordionItem id="term-dates" title="Term Dates">
        <p>Autumn term starts in September</p>
      </AccordionItem>
    </dl>,
  )
}

const setHash = (hash: string): void => {
  window.history.replaceState(null, '', hash ? `/${hash}` : '/')
}

describe('AccordionItem', () => {
  const scrollIntoView = vi.fn()

  beforeEach(() => {
    // jsdom does not implement scrollIntoView
    Element.prototype.scrollIntoView = scrollIntoView
  })

  afterEach(() => {
    setHash('')
    scrollIntoView.mockReset()
  })

  it('renders the title closed by default', () => {
    renderItem()

    expect(screen.getByRole('button', { name: 'Term Dates' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(
      screen.queryByText('Autumn term starts in September'),
    ).not.toBeInTheDocument()
  })

  it('exposes its id so it can be targeted by a URL hash', () => {
    const { container } = render(
      <AccordionItem id="term-dates" title="Term Dates">
        body
      </AccordionItem>,
    )

    expect(container.querySelector('#term-dates')).not.toBeNull()
  })

  it('toggles open when the title is clicked', () => {
    renderItem()

    fireEvent.click(screen.getByRole('button', { name: 'Term Dates' }))

    expect(screen.getByRole('button', { name: 'Term Dates' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(
      screen.getByText('Autumn term starts in September'),
    ).toBeInTheDocument()
  })

  it('opens and scrolls into view when the page loads with a matching hash', () => {
    setHash('#term-dates')

    renderItem()

    expect(screen.getByRole('button', { name: 'Term Dates' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' })
  })

  it('stays closed when the hash targets something else', () => {
    setHash('#contact')

    renderItem()

    expect(screen.getByRole('button', { name: 'Term Dates' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('opens when the hash changes to match after load', () => {
    renderItem()

    act(() => {
      setHash('#term-dates')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })

    expect(screen.getByRole('button', { name: 'Term Dates' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  it('does not close an already open item when the hash is re-applied', () => {
    renderItem()
    fireEvent.click(screen.getByRole('button', { name: 'Term Dates' }))

    act(() => {
      setHash('#term-dates')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })

    expect(screen.getByRole('button', { name: 'Term Dates' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })
})
