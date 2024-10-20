import {
  BuildingOffice2Icon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
import { MDXRemote } from 'next-mdx-remote/rsc'

import { mdxOptions, mdxGridComponents } from '@/data/mdxConfig'

export type ContactFormProps = {
  text: string
  address: string
  number: string
  email: string
}
export const ContactDetails = (props: ContactFormProps) => {
  const numberLink = `tel:${props.number}`
  const emailLink = `mailto:${props.email}`

  return (
    <div className="relative px-6 py-12 lg:static lg:px-8">
      <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
        <div className="absolute inset-y-0 left-0 -z-10 w-full overflow-hidden bg-gray-100 ring-1 ring-gray-900/10 lg:w-1/2">
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
          >
            <defs>
              <pattern
                x="100%"
                y={-1}
                id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
                width={150}
                height={150}
                patternUnits="userSpaceOnUse"
              >
                <path d="M130 200V.5M.5 .5H200" fill="none" />
              </pattern>
            </defs>
            <rect fill="white" width="100%" height="100%" strokeWidth={0} />
            <svg x="100%" y={-1} className="overflow-visible fill-gray-50">
              <path d="M-470.5 0h201v201h-201Z" strokeWidth={0} />
            </svg>
            <rect
              fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)"
              width="100%"
              height="100%"
              strokeWidth={0}
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Get in touch
        </h2>
        <pre className="prose mt-6 text-lg leading-8 text-gray-600">
          <MDXRemote
            options={mdxOptions}
            source={props.text}
            components={mdxGridComponents}
          />
        </pre>
        <dl className="mt-10 space-y-4 text-base leading-7 text-gray-600">
          <div className="flex gap-x-4">
            <dt className="flex-none">
              <span className="sr-only">Address</span>
              <BuildingOffice2Icon
                aria-hidden="true"
                className="h-7 w-6 text-gray-400"
              />
            </dt>
            <dd>
              <pre>{props.address}</pre>
            </dd>
          </div>
          <div className="flex gap-x-4">
            <dt className="flex-none">
              <span className="sr-only">Telephone</span>
              <PhoneIcon aria-hidden="true" className="h-7 w-6 text-gray-400" />
            </dt>
            <dd>
              <a href={numberLink} className="hover:text-gray-900">
                {props.number}
              </a>
            </dd>
          </div>
          <div className="flex gap-x-4">
            <dt className="flex-none">
              <span className="sr-only">Email</span>
              <EnvelopeIcon
                aria-hidden="true"
                className="h-7 w-6 text-gray-400"
              />
            </dt>
            <dd>
              <a href={emailLink} className="hover:text-gray-900">
                {props.email}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
