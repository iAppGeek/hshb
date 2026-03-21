import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import Tooltip from './Tooltip'

describe('Tooltip', () => {
  it('renders children', () => {
    render(
      <Tooltip text="Hint">
        <button>Click me</button>
      </Tooltip>,
    )
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('renders tooltip text with role="tooltip"', () => {
    render(
      <Tooltip text="Hint text">
        <span>Target</span>
      </Tooltip>,
    )
    expect(screen.getByRole('tooltip')).toHaveTextContent('Hint text')
  })

  it('tooltip is hidden by default (opacity-0)', () => {
    render(
      <Tooltip text="Hidden">
        <span>Target</span>
      </Tooltip>,
    )
    expect(screen.getByRole('tooltip').className).toContain('opacity-0')
  })
})
