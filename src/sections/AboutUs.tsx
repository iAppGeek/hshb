import { Container } from '@/components/Container'
import {FaqAcordian} from "@/components/CenteredAccordion";

const tableOfContents = {
  'Curriculum': {
    'Education': 1,
    'Culture': 10,
    'Dance': 28,
    'Events': 20,
  },
  'The Commitee': {
    'Why Join': 21,
    'How it Works': 22,
    'Fundraisers': 26,
    'Volunteers': 31,
    'Non elected memebers': 45,
  },
  'Boolean operations': {
    'Combining shapes': 50,
    'Subtracting shapes': 57,
    'Intersecting shapes': 66,
    Flattening: 78,
  },
  'Optimizing for production': {
    'Preparing for SVG': 82,
    'Configuring your export settings': 88,
    'Minifying and removing metadata': 95,
  },
}

export function AboutUs() {
  return (
    <section
      id="about-us"
      aria-labelledby="about-us-title"
      className="py-8 m:py-10 lg:py-8"
    >
      <Container>
        <p className="mt-8 font-display text-xl font-bold tracking-tight text-slate-900">
          We don’t just teach our children the Greek language, we also educate and enhance their knowledge of Greek and Cypriot lifestyles; from the Greek Orthodox religion, to the history and culture of the Hellenes. This includes traditional costumes, dance and music, celebrations of popular events, folk plays, what it was like to be Greek in our grandparents' time, and to move with changing times.
        </p>
      </Container>
      <FaqAcordian />
    </section>
  )
}
