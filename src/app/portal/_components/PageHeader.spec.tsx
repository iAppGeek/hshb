import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import PageHeader from './PageHeader'

describe('PageHeader', () => {
  it('renders the title', () => {
    render(<PageHeader title="Staff" />)
    expect(screen.getByRole('heading', { name: 'Staff' })).toBeTruthy()
  })

  it('renders an action when provided', () => {
    render(<PageHeader title="Classes" action={<button>Add Class</button>} />)
    expect(screen.getByRole('button', { name: 'Add Class' })).toBeTruthy()
  })

  it('renders no action when omitted', () => {
    render(<PageHeader title="Students" />)
    expect(screen.queryByRole('button')).toBeNull()
  })
})
