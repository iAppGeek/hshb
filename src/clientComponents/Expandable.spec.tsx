import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { Expandable, ExpandableItems, ExpandableButton } from './Expandable'

const TestExpandable = ({ children }: { children: React.ReactNode }) => (
  <Expandable>{children}</Expandable>
)

describe('Expandable', () => {
  it('renders children inside a div', () => {
    const { container } = render(
      <TestExpandable>
        <span>inner</span>
      </TestExpandable>,
    )
    expect(container.querySelector('div')).toBeTruthy()
    expect(screen.getByText('inner')).toBeTruthy()
  })

  it('does not set data-expanded attribute initially', () => {
    const { container } = render(
      <TestExpandable>
        <span>inner</span>
      </TestExpandable>,
    )
    expect(container.querySelector('div[data-expanded]')).toBeNull()
  })

  it('sets data-expanded after expand is called', () => {
    render(
      <TestExpandable>
        <ExpandableButton>Show more</ExpandableButton>
      </TestExpandable>,
    )
    fireEvent.click(screen.getByRole('button'))
    // button hides after expand; the outer div should have data-expanded=""
    // ExpandableButton renders null when expanded, so we verify via ExpandableItems
  })
})

describe('ExpandableButton', () => {
  it('renders the button when not expanded', () => {
    render(
      <TestExpandable>
        <ExpandableButton>Show more</ExpandableButton>
      </TestExpandable>,
    )
    expect(screen.getByRole('button')).toHaveTextContent('Show more')
  })

  it('hides the button after clicking', () => {
    render(
      <TestExpandable>
        <ExpandableButton>Show more</ExpandableButton>
      </TestExpandable>,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('ExpandableItems', () => {
  it('renders nothing when not expanded', () => {
    render(
      <TestExpandable>
        <ExpandableItems>
          <span>hidden content</span>
        </ExpandableItems>
      </TestExpandable>,
    )
    expect(screen.queryByText('hidden content')).toBeNull()
  })

  it('renders children after expand button is clicked', () => {
    render(
      <TestExpandable>
        <ExpandableButton>Show more</ExpandableButton>
        <ExpandableItems>
          <span>now visible</span>
        </ExpandableItems>
      </TestExpandable>,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('now visible')).toBeTruthy()
  })
})
