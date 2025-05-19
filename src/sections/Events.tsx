import Image from 'next/image'

import { Container } from '@/components/Container'
import discordImage from '@/images/resources/discord.svg'
import { PastEvent } from '@/data/contentful'

const PlaceholderImage = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center bg-[#6366F1]">
        <Image src={discordImage} alt="" />
      </div>
    </div>
  )
}

type Props = { events: PastEvent[] }
export const Events = (props: Props) => {
  return (
    <section
      id="events"
      aria-labelledby="events-title"
      className="m:py-10 py-8 lg:py-8"
    >
      <Container className="mt-8">
        <p className="font-display mt-8 mb-4 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Our Events Calendar
        </p>
        <iframe
          src="https://calendar.google.com/calendar/embed?height=600&wkst=2&ctz=Europe%2FLondon&showPrint=0&hl=en_GB&showCalendars=0&title&src=dG9uLmFudG9uaWFkb3VAZ21haWwuY29t&color=%233F51B5"
          style={{ display: 'block' }}
          className="mx-auto pb-5"
          width="100%"
          height="500"
          title="HSHB Events Calendar"
          frameBorder="0"
          scrolling="no"
        ></iframe>
      </Container>
      <Container>
        <p className="font-display mt-8 text-4xl font-bold tracking-tight text-slate-900">
          Some of our recent events
        </p>
        <p className="mt-4 text-lg tracking-tight text-slate-700">
          We hold many events over the school year to showcase what our children
          have been learning and to help raise funds for the school
        </p>
      </Container>
      <Container size="lg" className="mt-16">
        <ol className="-mx-3 grid grid-cols-1 gap-y-10 lg:grid-cols-3 lg:text-center xl:-mx-12 xl:divide-x xl:divide-slate-400/20">
          {props.events.map((event) => (
            <li
              key={event.name}
              className="grid auto-rows-min grid-cols-1 items-center gap-8 px-3 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-1 xl:px-12"
            >
              <div className="relative h-48 overflow-hidden rounded-2xl shadow-lg sm:h-60 lg:h-40">
                {event.media && event.media[0] ? (
                  <Image
                    className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-110"
                    src={event.media[0]}
                    alt={event.name + 'photo'}
                    width={300}
                    height={300}
                    sizes="(min-width: 1280px) 17.5rem, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                ) : (
                  <PlaceholderImage />
                )}
              </div>
              <div>
                <h3 className="text-base font-medium tracking-tight text-slate-900">
                  {event.name}
                </h3>
                <p className="mt-2 text-slate-800">
                  {event.date.toDateString()}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {event.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
