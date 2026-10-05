import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'

import { AccordionGroup, useAccordion } from './AccordionGroup'
import { AccordionItem } from './AccordionItem'

const ITEMS = [
  { id: 'faq-hours', title: 'Operating Hours' },
  { id: 'faq-term-dates', title: 'Term Dates' },
]

const renderGroup = ({ strict = false }: { strict?: boolean } = {}): ReturnType<
  typeof render
> => {
  const group = (
    <AccordionGroup ids={ITEMS.map((i): string => i.id)}>
      {ITEMS.map(
        (i): React.JSX.Element => (
          <AccordionItem key={i.id} id={i.id} title={i.title}>
            <p>{i.title} body</p>
          </AccordionItem>
        ),
      )}
    </AccordionGroup>
  )
  return render(strict ? <StrictMode>{group}</StrictMode> : group)
}

const button = (name: string): HTMLElement =>
  screen.getByRole('button', { name })

const setHash = (hash: string): void => {
  window.history.replaceState(null, '', `/${hash}`)
}

const changeHash = (hash: string): void => {
  act((): void => {
    setHash(hash)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
}

const appendLink = (href: string): HTMLAnchorElement => {
  const link = document.createElement('a')
  link.href = href
  link.textContent = 'link'
  link.addEventListener('click', (e): void => e.preventDefault(), {
    once: true,
  })
  document.body.appendChild(link)
  return link
}

describe('AccordionGroup', (): void => {
  const scrollIntoView = vi.fn()

  beforeEach((): void => {
    // jsdom does not implement scrollIntoView
    Element.prototype.scrollIntoView = scrollIntoView
  })

  afterEach((): void => {
    setHash('')
    scrollIntoView.mockReset()
    document.querySelectorAll('body > a').forEach((a): void => a.remove())
  })

  it('renders every item closed when there is no hash', (): void => {
    renderGroup()

    expect(button('Operating Hours')).toHaveAttribute('aria-expanded', 'false')
    expect(button('Term Dates')).toHaveAttribute('aria-expanded', 'false')
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('marks the list ready once mounted', (): void => {
    const { container } = renderGroup()

    expect(container.querySelector('dl')).toHaveAttribute('data-ready')
  })

  it('opens the item matching the hash on load and scrolls to it', (): void => {
    setHash('#faq-term-dates')

    renderGroup()

    expect(button('Term Dates')).toHaveAttribute('aria-expanded', 'true')
    expect(button('Operating Hours')).toHaveAttribute('aria-expanded', 'false')
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' })
  })

  it('stays open on load under StrictMode (never toggles)', (): void => {
    setHash('#faq-term-dates')

    renderGroup({ strict: true })

    expect(button('Term Dates')).toHaveAttribute('aria-expanded', 'true')
  })

  it('decodes percent-encoded hashes and tolerates malformed ones', (): void => {
    setHash('#faq%2Dterm%2Ddates')
    renderGroup()
    expect(button('Term Dates')).toHaveAttribute('aria-expanded', 'true')

    changeHash('#%E0%A4%A')
    expect(button('Term Dates')).toHaveAttribute('aria-expanded', 'true')
  })

  it('ignores hashes that do not match an item', (): void => {
    renderGroup()
    fireEvent.click(button('Operating Hours'))

    changeHash('#contact')

    expect(button('Operating Hours')).toHaveAttribute('aria-expanded', 'true')
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('opens the targeted item and closes the others on hashchange', (): void => {
    renderGroup()
    fireEvent.click(button('Operating Hours'))

    changeHash('#faq-term-dates')

    expect(button('Term Dates')).toHaveAttribute('aria-expanded', 'true')
    expect(button('Operating Hours')).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps an already open item open when its hash is applied', (): void => {
    renderGroup()
    fireEvent.click(button('Term Dates'))

    changeHash('#faq-term-dates')

    expect(button('Term Dates')).toHaveAttribute('aria-expanded', 'true')
  })

  it('reopens the item when a link to the current hash is clicked', (): void => {
    setHash('#faq-term-dates')
    renderGroup()
    fireEvent.click(button('Term Dates'))
    expect(button('Term Dates')).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(appendLink('#faq-term-dates'))

    expect(button('Term Dates')).toHaveAttribute('aria-expanded', 'true')
  })

  it('ignores modified clicks and links elsewhere', (): void => {
    setHash('#faq-term-dates')
    renderGroup()
    fireEvent.click(button('Term Dates'))

    fireEvent.click(appendLink('#faq-term-dates'), { metaKey: true })
    fireEvent.click(appendLink('/other#faq-term-dates'))
    fireEvent.click(appendLink('/'))
    fireEvent.click(document.body)

    expect(button('Term Dates')).toHaveAttribute('aria-expanded', 'false')
  })

  it('removes its listeners on unmount', (): void => {
    const { unmount } = renderGroup()
    unmount()

    expect((): void => changeHash('#faq-term-dates')).not.toThrow()
    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})

describe('useAccordion', (): void => {
  it('throws when used outside an AccordionGroup', (): void => {
    const Orphan = (): null => {
      useAccordion()
      return null
    }
    vi.spyOn(console, 'error').mockImplementation((): void => {})

    expect((): void => {
      render(<Orphan />)
    }).toThrow('AccordionItem must be rendered inside an AccordionGroup')
  })
})
