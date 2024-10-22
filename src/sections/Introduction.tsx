import { Container } from '@/components/Container'
import { HeroVideo } from '@/components/HeroVideo'

type Props = { text: string }
export const Introduction = (props: Props) => {
  return (
    <section
      id="introduction"
      aria-label="Introduction"
      className="py-4 sm:py-6 lg:py-10"
    >
      <Container className="text-lg tracking-tight text-slate-700">
        <blockquote>
          <pre className="prose font-display text-4xl font-bold tracking-tight text-slate-900">
            <p>{props.text}</p>
          </pre>
        </blockquote>
      </Container>
      <HeroVideo
        space={process.env.CONTENTFUL_SPACE}
        token={process.env.CONTENTFUL_TOKEN}
      />
    </section>
  )
}
