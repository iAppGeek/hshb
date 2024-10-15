import { Container } from '@/components/Container'
import { FaqAcordian } from '@/components/CenteredAccordion'

type Props = { text: string }
export const AboutUs = (props: Props) => {
  return (
    <section
      id="about-us"
      aria-labelledby="about-us-title"
      className="m:py-10 py-8 lg:py-8"
    >
      <Container>
        <p className="mt-8 font-display text-xl font-bold tracking-tight text-slate-900">
          {props.text}
        </p>
      </Container>
      <FaqAcordian />
    </section>
  )
}
