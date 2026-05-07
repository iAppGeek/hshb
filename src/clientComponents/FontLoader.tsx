'use client'

import { useEffect } from 'react'

export const FontLoader = (): null => {
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href =
      'https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,500,700&display=swap'
    document.head.appendChild(link)
  }, [])

  return null
}
