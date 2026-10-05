'use client'

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import { useEffect, useRef } from 'react'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'

type Props = {
  id: string
  title: string
  children: React.ReactNode
}

// Opens itself when the URL hash matches its id, so items can be linked to
// directly (e.g. /#operating-hours-term-dates).
export const AccordionItem = ({
  id,
  title,
  children,
}: Props): React.JSX.Element => {
  const itemRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const openIfTargeted = (): void => {
      const button = buttonRef.current
      if (!button || window.location.hash !== `#${id}`) return

      if (button.getAttribute('aria-expanded') !== 'true') button.click()
      itemRef.current?.scrollIntoView({ block: 'start' })
    }

    openIfTargeted()
    window.addEventListener('hashchange', openIfTargeted)
    return () => window.removeEventListener('hashchange', openIfTargeted)
  }, [id])

  return (
    <Disclosure as="div" id={id} ref={itemRef} className="scroll-mt-20 pt-6">
      <dt>
        <DisclosureButton
          ref={buttonRef}
          className="group flex w-full items-start justify-between text-left text-gray-900"
        >
          <span className="text-base leading-7 font-semibold">{title}</span>
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
        {children}
      </DisclosurePanel>
    </Disclosure>
  )
}
