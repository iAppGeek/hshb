import Image from 'next/image'
import { Container } from '@/components/Container'
import discordImage from '@/images/resources/discord.svg'
import figmaImage from '@/images/resources/figma.svg'

const resources = [
  {
    title: 'Annual Blessing',
    description:
      "Annual blessing of the school by Father Joseph. Also in attendance will be Christos Karaolis, the President of the National Federation of Cypriots in the UK",
    image: function DiscordImage() {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[#6366F1]">
          <Image src={discordImage} alt="" unoptimized />
        </div>
      )
    },
  },
  {
    title: 'Cypriot Wine Festival',
    description:
      '5th-6th October 2024',
    image: function FigmaImage() {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(#2C313D_35%,#000)]">
          <Image src={figmaImage} alt="" unoptimized />
        </div>
      )
    },
  },
  {
    title: 'Summer BBQ',
    description:
      'July 2024',
    image: function VideoPlayerImage() {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center bg-[#6366F1]">
            <Image src={discordImage} alt="" unoptimized />
          </div>
        </div>
      )
    },
  },
]

export function Events() {
  return (
    <section
      id="events"
      aria-labelledby="events-title"
      className="py-8 m:py-10 lg:py-8">

      <Container>
        <p className="mt-8 font-display text-4xl font-bold tracking-tight text-slate-900">
          Some of our recent events
        </p>
        <p className="mt-4 text-lg tracking-tight text-slate-700">
          Design assets, icon teardowns, and a community of fellow icon
          designers where you can ask questions, get feedback, and accelerate
          your learning.
        </p>
      </Container>
      <Container size="lg" className="mt-16">
        <ol
          role="list"
          className="-mx-3 grid grid-cols-1 gap-y-10 lg:grid-cols-3 lg:text-center xl:-mx-12 xl:divide-x xl:divide-slate-400/20"
        >
          {resources.map((resource) => (
            <li
              key={resource.title}
              className="grid auto-rows-min grid-cols-1 items-center gap-8 px-3 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-1 xl:px-12"
            >
              <div className="relative h-48 overflow-hidden rounded-2xl shadow-lg sm:h-60 lg:h-40">
                <resource.image />
              </div>
              <div>
                <h3 className="text-base font-medium tracking-tight text-slate-900">
                  {resource.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {resource.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
