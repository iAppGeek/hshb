'use client'

import { FC, useEffect, useState } from 'react'

import { FeaturedQuote } from '@/data/contentful'
import { getRandomInt } from '@/data/numbers'

const FeaturedQuoteComp: FC<{ quote?: FeaturedQuote }> = ({ quote }) => {
  return (
    <figure className="relative mx-auto max-w-md text-center lg:mx-0 lg:text-left">
      <blockquote className="mt-2">
        <p className="font-display text-xl font-medium text-slate-900">
          {quote?.text}
        </p>
      </blockquote>
      <figcaption className="mt-2 text-sm text-slate-500">
        <strong className="pr-1 font-semibold text-blue-600 before:content-['—_']">
          {quote?.author}
        </strong>
        {quote?.role}
      </figcaption>
    </figure>
  )
}

type Props = {
  items: FeaturedQuote[]
}
export const FeaturedQuoteSelector = ({ items }: Props) => {
  const [selectedQuoteIndex, setSelectedQuoteIndex] = useState<number>(0)

  useEffect(() => {
    setSelectedQuoteIndex(getRandomInt(items.length))

    const interval = setInterval(() => {
      setSelectedQuoteIndex(getRandomInt(items.length))
    }, 20_000)
    return () => {
      clearInterval(interval)
    }
  }, [items])

  return <FeaturedQuoteComp quote={items[selectedQuoteIndex]} />
}
