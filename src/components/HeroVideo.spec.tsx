import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'

import { HeroVideo } from './HeroVideo'

describe('HeroVideo', () => {
  it('renders the container div', () => {
    const { container } = render(<HeroVideo videoUrl={undefined} />)
    expect(container.querySelector('.video_container')).toBeTruthy()
  })

  it('renders nothing inside container when videoUrl is undefined', () => {
    const { container } = render(<HeroVideo videoUrl={undefined} />)
    const videoContainer = container.querySelector('.video_container')
    expect(videoContainer?.children).toHaveLength(0)
  })

  it('renders Suspense fallback while video loads', () => {
    const { getByText } = render(
      <HeroVideo videoUrl="https://example.com/video.mp4" />,
    )
    // VideoComponent is an async server component; Suspense shows fallback in jsdom
    expect(getByText('Loading video...')).toBeTruthy()
  })

  it('renders container with overflow-hidden when url is provided', () => {
    const { container } = render(
      <HeroVideo videoUrl="https://example.com/video.mp4" />,
    )
    expect(container.querySelector('.video_container')).toHaveClass(
      'overflow-hidden',
    )
  })
})
