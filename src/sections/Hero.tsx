import Image from 'next/image'

import logo from '@/images/logo.png'
import { FeaturedQuote } from '@/data/contentful'
import { FeaturedQuoteSelector } from '@/clientComponents/FeaturedQuoteSelector'

type Props = { heroText: string; quotes: FeaturedQuote[] }
export const Hero = (props: Props) => {
  return (
    <header className="overflow-hidden bg-slate-100 lg:bg-transparent">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-y-6 md:pt-8 lg:grid-cols-12 lg:px-3 lg:pb-12">
        <div className="relative flex items-center lg:col-span-5 lg:row-span-2">
          <div className="rounded-br-6xl absolute -top-20 right-1/2 -bottom-12 left-0 z-10 bg-blue-800 text-white/10 md:bottom-8 lg:-inset-y-12 lg:right-full lg:left-[-100vw] lg:-mr-40" />
          <div className="relative z-10 mx-auto flex w-64 pt-12 md:w-80 lg:pt-24">
            <Image className="w-full" src={logo} alt="" placeholder="blur" />
          </div>
        </div>
        <div className="relative px-4 py-6 pb-0 sm:px-6 md:py-0 lg:col-span-7 lg:pt-0 lg:pr-0 lg:pb-8 lg:pl-16">
          <div className="hidden lg:absolute lg:-top-32 lg:right-[-100vw] lg:bottom-0 lg:left-[-100vw] lg:block lg:bg-slate-100" />
          <FeaturedQuoteSelector items={props.quotes} />
        </div>
        <div className="bg-white pt-16 lg:col-span-7 lg:bg-transparent lg:pt-0 lg:pl-16 xl:pl-20">
          <div className="mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:px-0">
            <h1 className="font-display text-4xl font-extrabold text-slate-900 sm:text-6xl">
              The Hellenic School @ Cockfosters
            </h1>
            <p className="mt-4 text-2xl text-slate-600">{props.heroText}</p>
            <div className="mt-8 flex gap-4" />
          </div>
        </div>
      </div>
    </header>
  )
}
