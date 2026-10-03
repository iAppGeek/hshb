import { MDXRemote } from 'next-mdx-remote/rsc'

import { Container } from '@/components/Container'
import { ScrollTracker } from '@/clientComponents/ScrollTracker'
import { mdxGridComponents, mdxOptions } from '@/data/mdxConfig'
import { POLICIES_PATH } from '@/data/policies'

type Props = {
  text: string
}
export const Enrolement = async (props: Props) => {
  return (
    <section
      id="enrolment"
      aria-labelledby="admissions-title"
      className="m:py-10 py-8 lg:py-8"
    >
      <Container className="text-center">
        <h2
          id="admissions-title"
          className="font-display mt-8 text-4xl font-bold tracking-tight text-slate-900"
        >
          Interested in joining our school...
        </h2>
      </Container>
      <Container>
        <pre className="prose font-display mt-8 flex flex-col text-xl tracking-tight text-slate-900">
          <MDXRemote
            options={mdxOptions}
            source={props.text}
            components={mdxGridComponents}
          />
        </pre>
        <p className="mt-6 text-base tracking-tight text-slate-700">
          Before registering, please read our{' '}
          <a
            href={POLICIES_PATH}
            target="_blank"
            rel="noopener"
            className="font-semibold text-blue-600 hover:text-blue-800"
          >
            School Policies and Privacy Notice
          </a>
          .
        </p>
      </Container>
      <ScrollTracker section="enrolment" />
    </section>
  )
}
