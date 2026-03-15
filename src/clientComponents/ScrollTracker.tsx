'use client'

import { useEffect, useRef } from 'react'

import { sendEvent } from '@/data/events'

export function ScrollTracker({ section }: { section: string }) {
  const sentRef = useRef(false)

  useEffect(() => {
    const el = document.getElementById(section)
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !sentRef.current) {
          sentRef.current = true
          sendEvent('scroll', 'section-view', { section })
          observer.disconnect()
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [section])

  return null
}
