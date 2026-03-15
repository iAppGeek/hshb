import { MDXRemote } from 'next-mdx-remote/rsc'

import { Container } from '@/components/Container'
import { ScrollTracker } from '@/clientComponents/ScrollTracker'
import { AboutUsAcordian } from '@/components/AboutUsAcordian'
import { HighlightedTexts } from '@/components/HighlightedTexts'
import type { AccordianData } from '@/data/contentful'
import { mdxGridComponents, mdxOptions } from '@/data/mdxConfig'

type Props = {
  text: string
  highlightedTexts: [string, string]
  accordian: AccordianData
}
export const AboutUs = async (props: Props) => {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: props.accordian.map((item) => ({
      '@type': 'Question',
      name: item.title,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.body,
      },
    })),
  }

  return (
    <section
      id="about-us"
      aria-labelledby="about-us-title"
      className="m:py-10 py-8 lg:py-8"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Container>
        <h2 id="about-us-title" className="sr-only">
          About Us
        </h2>
        <pre className="prose font-display my-8 flex flex-col text-xl tracking-tight text-slate-900">
          <MDXRemote
            options={mdxOptions}
            source={props.text}
            components={mdxGridComponents}
          />
        </pre>
      </Container>
      <Container className="mt-6">
        <div className="flex">
          <div className="flex-1 text-center">
            <p className="font-display text-base font-semibold text-slate-700">
              Average Class Size
            </p>
            <p className="font-display text-4xl font-bold text-blue-500">12</p>
          </div>
          <div className="flex-1 text-center">
            <p className="font-display text-base font-semibold text-slate-700">
              Exam Pass Rate
            </p>
            <p className="font-display text-4xl font-bold text-green-600">
              95%
            </p>
          </div>
        </div>
      </Container>
      <AboutUsAcordian data={props.accordian} />
      <HighlightedTexts
        id="about-us-highlighted"
        first={props.highlightedTexts[0]}
        second={props.highlightedTexts[1]}
      />
      <ScrollTracker section="about-us" />
    </section>
  )
}
