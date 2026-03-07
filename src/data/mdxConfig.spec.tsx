import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'

vi.mock('remark-gfm', () => ({ default: vi.fn(() => ({})) }))

import { mdxOptions, mdxGridComponents } from './mdxConfig'
import remarkGfm from 'remark-gfm'

describe('mdxOptions', () => {
  it('includes remarkGfm in remarkPlugins', () => {
    expect(mdxOptions.mdxOptions.remarkPlugins).toContain(remarkGfm)
  })

  it('has an empty rehypePlugins array', () => {
    expect(mdxOptions.mdxOptions.rehypePlugins).toEqual([])
  })
})

describe('mdxGridComponents', () => {
  it('p renders with mb-0 class', () => {
    const { container } = render(
      React.createElement(mdxGridComponents.p, {}, 'hello'),
    )
    expect(container.querySelector('p')).toHaveClass('mb-0')
    expect(container.querySelector('p')).toHaveTextContent('hello')
  })

  it('table renders with table-auto class', () => {
    const { container } = render(
      React.createElement(mdxGridComponents.table, {}, null),
    )
    expect(container.querySelector('table')).toHaveClass('table-auto')
  })

  it('th renders with expected classes', () => {
    const { container } = render(
      React.createElement(mdxGridComponents.th, {}, 'Header'),
    )
    const th = container.querySelector('th')
    expect(th).toHaveClass('text-center')
    expect(th).toHaveClass('font-semibold')
    expect(th).toHaveTextContent('Header')
  })

  it('td renders with expected classes', () => {
    const { container } = render(
      React.createElement(mdxGridComponents.td, {}, 'Cell'),
    )
    const td = container.querySelector('td')
    expect(td).toHaveClass('text-center')
    expect(td).toHaveTextContent('Cell')
  })

  it('img renders with mx-auto class', () => {
    const { container } = render(
      React.createElement(mdxGridComponents.img, { src: '/test.png' }),
    )
    const img = container.querySelector('img')
    expect(img).toHaveClass('mx-auto')
    expect(img).toHaveAttribute('src', '/test.png')
  })
})
