import Image from 'next/image'
import logo from '@/images/logo.png'
import * as contentful from 'contentful'

const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE,
  accessToken: process.env.CONTENTFUL_TOKEN,
})

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

async function Testimonial() {

  // can directly fetch a random item, rather than fetting all and showing 1
  // https://github.com/contentful/contentful.swift/issues/190
  const entries = await client.getEntries({ content_type: "quotes" })
  const quote = entries.items[getRandomInt(entries.items.length)];

  return (
    <figure className="relative mx-auto max-w-md text-center lg:mx-0 lg:text-left">
      <blockquote className="mt-2">
        <p className="font-display text-xl font-medium text-slate-900">
          {quote.fields["text"] as string}
        </p>
      </blockquote>
      <figcaption className="mt-2 text-sm text-slate-500">
        <strong className="font-semibold text-blue-600 before:content-['—_']">
          {quote.fields["author"] as string}
        </strong>
        , {quote.fields["role"] as string}
      </figcaption>
    </figure>
  )
}

export function Hero() {
  return (
    <header className="overflow-hidden bg-slate-100 lg:bg-transparent">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-y-6 md:pt-8 lg:grid-cols-12 lg:px-3 lg:pb-12">
        <div className="relative flex items-center lg:col-span-5 lg:row-span-2">
          <div className="absolute -bottom-12 -top-20 left-0 right-1/2 z-10 rounded-br-6xl bg-blue-800 text-white/10 md:bottom-8 lg:-inset-y-12 lg:left-[-100vw] lg:right-full lg:-mr-40"/>
          <div className="relative z-10 mx-auto flex w-64 md:w-80 pt-12 lg:pt-24">
            <Image className="w-full" src={logo} alt="" placeholder="blur" />
          </div>
        </div>
        <div className="relative px-4 py-6 sm:px-6 md:py-0 pb-0 lg:col-span-7 lg:pb-8 lg:pt-0 lg:pl-16 lg:pr-0">
          <div className="hidden lg:absolute lg:-top-32 lg:bottom-0 lg:left-[-100vw] lg:right-[-100vw] lg:block lg:bg-slate-100" />
          <Testimonial />
        </div>
        <div className="bg-white pt-16 lg:col-span-7 lg:bg-transparent lg:pl-16 lg:pt-0 xl:pl-20">
          <div className="mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:px-0">
            <h1 className="font-display text-4xl font-extrabold text-slate-900 sm:text-6xl">
              Hellenic School of High Barnet
            </h1>
            <p className="mt-4 text-2xl text-slate-600">
              We don’t just teach our children the Greek language, we also educate and enhance their knowledge of Greek and Cypriot lifestyles; from the Greek Orthodox religion, to the history and culture of the Hellenes. This includes traditional costumes, dance and music, celebrations of popular events, folk plays, what it was like to be Greek in our grandparents' time, and to move with changing times.
            </p>
            <div className="mt-8 flex gap-4" />
          </div>
        </div>
      </div>
    </header>
  )
}
