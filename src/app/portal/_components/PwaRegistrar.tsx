'use client'

import { useEffect } from 'react'

export default function PwaRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/portal-sw.js', { scope: '/portal' })
        .catch((err) => console.error('SW registration failed:', err))
    }
  }, [])

  return null
}
