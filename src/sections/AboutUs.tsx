import { MDXRemote } from 'next-mdx-remote/rsc'

import { Container } from '@/components/Container'
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
  return (
    <section
      id="about-us"
      aria-labelledby="about-us-title"
      className="m:py-10 py-8 lg:py-8"
    >
      <Container>
        <pre className="prose font-display mt-8 text-xl tracking-tight text-slate-900">
          <MDXRemote
            options={mdxOptions}
            source={props.text}
            components={mdxGridComponents}
          />
        </pre>
      </Container>
      <AboutUsAcordian data={props.accordian} />
      <HighlightedTexts
        id="about-us-highlighted"
        first={props.highlightedTexts[0]}
        second={props.highlightedTexts[1]}
      />
    </section>
  )
}
