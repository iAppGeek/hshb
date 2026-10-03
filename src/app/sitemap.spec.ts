import { describe, it, expect } from 'vitest'

import sitemap from './sitemap'

describe('sitemap', () => {
  it('lists the homepage and the policies page', () => {
    expect(sitemap().map((e) => e.url)).toEqual([
      'https://www.hshb.org.uk',
      'https://www.hshb.org.uk/policies',
    ])
  })
})
