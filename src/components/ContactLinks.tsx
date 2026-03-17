'use client'

import { PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

import { sendEvent } from '@/data/events'

type ContactLinksProps = {
  number: string
  email: string
}

export const ContactLinks = ({ number, email }: ContactLinksProps) => {
  return (
    <>
      <div className="flex gap-x-4">
        <dt className="flex-none">
          <span className="sr-only">Telephone</span>
          <PhoneIcon aria-hidden="true" className="h-7 w-6 text-gray-400" />
        </dt>
        <dd>
          <a
            href={`tel:${number}`}
            className="hover:text-gray-900"
            onClick={() => sendEvent('click', 'contact-phone')}
          >
            {number}
          </a>
        </dd>
      </div>
      <div className="flex gap-x-4">
        <dt className="flex-none">
          <span className="sr-only">Email</span>
          <EnvelopeIcon aria-hidden="true" className="h-7 w-6 text-gray-400" />
        </dt>
        <dd>
          <a
            href={`mailto:${email}?subject=Website%20Enquiry`}
            className="hover:text-gray-900"
            onClick={() => sendEvent('click', 'contact-email')}
          >
            {email}
          </a>
        </dd>
      </div>
    </>
  )
}
