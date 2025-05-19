import { FC } from 'react'

import { Container } from '@/components/Container'
import { HeroVideo } from '@/clientComponents/HeroVideo'

type Props = { text: string; videoUrl: string | undefined }
export const Introduction: FC<Props> = ({ text, videoUrl }) => {
  return (
    <section
      id="introduction"
      aria-label="Introduction"
      className="py-4 sm:py-6 lg:py-10"
    >
      <Container className="text-lg tracking-tight text-slate-700">
        <blockquote className="my-6">
          <p className="font-display text-4xl font-bold tracking-tight text-slate-900">
            <q>{text}</q>
          </p>
        </blockquote>
      </Container>
      <HeroVideo videoUrl={videoUrl} />
    </section>
  )
}
