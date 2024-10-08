import { Container } from '@/components/Container'
import { HeroVideo } from '@/components/HeroVideo'

export function Introduction() {
  return (
    <section
      id="introduction"
      aria-label="Introduction"
      className="py-4 sm:py-6 lg:py-10">
      <Container className="text-lg tracking-tight text-slate-700">
        <p className="font-display text-4xl font-bold tracking-tight text-slate-900">
          "Students and staff have worked very hard to make HSHB the outstanding school it is and we are all proud of our achievements.
        </p>
        <div>
        </div>
      </Container>
      <HeroVideo space={process.env.CONTENTFUL_SPACE} token={process.env.CONTENTFUL_TOKEN} />
    </section>
  )
}
