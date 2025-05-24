import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'

import { Container } from '@/components/Container'
import {
  Expandable,
  ExpandableButton,
  ExpandableItems,
} from '@/clientComponents/Expandable'
import { Testimonial, Author } from '@/data/contentful'
import { mdxGridComponents, mdxOptions } from '@/data/mdxConfig'

const TestimonialItem = ({
  author,
  text,
}: {
  author: Author
  text: string
}) => {
  return (
    <figure className="rounded-4xl p-8 shadow-md ring-1 ring-slate-900/5">
      <blockquote>
        <pre className="prose text-lg tracking-tight text-slate-900">
          <MDXRemote
            options={mdxOptions}
            source={text}
            components={mdxGridComponents}
          />
        </pre>
      </blockquote>
      <figcaption className="mt-6 flex items-center">
        <div className="overflow-hidden rounded-full bg-slate-50">
          <Image
            className="h-12 w-12 object-cover"
            src={author.image}
            alt=""
            width={48}
            height={48}
          />
        </div>
        <div className="ml-4">
          <div className="text-base leading-6 font-medium tracking-tight text-slate-900">
            {author.name}
          </div>
          <div className="mt-1 text-sm text-slate-600">{author.role}</div>
        </div>
      </figcaption>
    </figure>
  )
}

type Props = { testimonials: Testimonial[] }
export const Testimonials = (props: Props) => {
  // testimonials are the only props, so no reason to memo this now
  // if more things cause render, would need to add memo to stop moving around
  const testimonials = props.testimonials
    .map((value) => ({ value, index: Math.random() }))
    .sort((a, b) => a.index - b.index)
    .map(({ value }) => value)

  return (
    <section className="py-8 sm:py-10 lg:py-16">
      <Container className="text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900">
          Some kind words from our Parents...
        </h2>
        <p className="mt-4 text-lg tracking-tight text-slate-600">...</p>
      </Container>
      <Expandable className="group mt-4">
        <ul className="mx-auto grid max-w-2xl grid-cols-1 gap-8 px-4 lg:max-w-7xl lg:grid-cols-3 lg:px-8">
          {testimonials.slice(0, 3).map((testimonial) => (
            <li key={testimonial.title}>
              <TestimonialItem
                author={testimonial.author}
                text={testimonial.text}
              />
            </li>
          ))}
          <ExpandableItems>
            {testimonials.slice(3).map((t) => (
              <li key={t.title}>
                <TestimonialItem author={t.author} text={t.text} />
              </li>
            ))}
          </ExpandableItems>
        </ul>
        <ExpandableButton>Read more testimonials</ExpandableButton>
      </Expandable>
    </section>
  )
}
