import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'

import { AccordianData } from '@/data/contentful'
import { mdxGridComponents, mdxOptions } from '@/data/mdxConfig'

type Props = { data: AccordianData }
export const AboutUsAcordian = (props: Props) => {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-4 sm:py-8 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
          <h2 className="text-2xl leading-10 font-bold tracking-tight text-gray-900">
            Want to know more?
          </h2>
          <dl className="mt-6 space-y-3 divide-y divide-gray-900/10">
            {props.data.map((d) => (
              <Disclosure key={d.title} as="div" className="pt-6">
                <dt>
                  <DisclosureButton className="group flex w-full items-start justify-between text-left text-gray-900">
                    <span className="text-base leading-7 font-semibold">
                      {d.title}
                    </span>
                    <span className="ml-6 flex h-7 items-center">
                      <PlusIcon
                        aria-hidden="true"
                        className="h-6 w-6 group-data-open:hidden"
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
                  className="prose mt-2 origin-top overflow-y-auto pr-12 transition duration-200 ease-out data-closed:-translate-y-6 data-closed:opacity-0"
                  transition
                >
                  <MDXRemote
                    options={mdxOptions}
                    source={d.body}
                    components={mdxGridComponents}
                  />
                </DisclosurePanel>
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
