'use client'

import { useEffect, useRef, useState } from 'react'

import { sendEvent } from '@/data/events'

type Props = {
  src: string
  title: string
  height?: number
}

export const CalendarEmbed = ({ src, title, height = 500 }: Props) => {
  const [loaded, setLoaded] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          sendEvent('view', 'calendar-scrolled-into-view')
          setLoaded(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={sentinelRef}
      className="mx-auto pb-5"
      style={{ height, width: '100%' }}
    >
      {loaded ? (
        <iframe
          src={src}
          style={{ display: 'block' }}
          width="100%"
          height={height}
          title={title}
          frameBorder="0"
          scrolling="no"
        />
      ) : (
        <div className="h-full w-full rounded-xl border border-slate-200 bg-slate-50" />
      )}
    </div>
  )
}
