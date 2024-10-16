import { Container } from '@/components/Container'
import { AboutUsAcordian } from '@/components/AboutUsAcordian'
import { HighlightedTexts } from '@/components/HighlightedTexts'
import type { AccordianData } from '@/data/contentful'

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
        <pre className="mt-8 font-display text-xl font-bold tracking-tight text-slate-900">
          {props.text}
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
