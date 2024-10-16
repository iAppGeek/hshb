import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'

import { AccordianData } from '@/data/contentful'

type Props = { data: AccordianData }
export const AboutUsAcordian = (props: Props) => {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-4 sm:py-8 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
            Want to know more?
          </h2>
          <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
            {props.data.map((d) => (
              <Disclosure key={d.title} as="div" className="pt-6">
                <dt>
                  <DisclosureButton className="group flex w-full items-start justify-between text-left text-gray-900">
                    <span className="text-base font-semibold leading-7">
                      {d.title}
                    </span>
                    <span className="ml-6 flex h-7 items-center">
                      <PlusIcon
                        aria-hidden="true"
                        className="h-6 w-6 group-data-[open]:hidden"
                      />
                      <MinusIcon
                        aria-hidden="true"
                        className="h-6 w-6 [.group:not([data-open])_&]:hidden"
                      />
                    </span>
                  </DisclosureButton>
                </dt>
                <DisclosurePanel
                  as="dd"
                  className="mt-2 origin-top pr-12 transition duration-200 ease-out data-[closed]:-translate-y-6 data-[closed]:opacity-0"
                  transition
                >
                  <pre className="text-base leading-7 text-gray-600">
                    {d.body}
                  </pre>
                </DisclosurePanel>
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
