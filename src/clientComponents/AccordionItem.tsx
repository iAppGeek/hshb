'use client'

import { Transition } from '@headlessui/react'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'

import { useAccordion } from '@/clientComponents/AccordionGroup'

type Props = {
  id: string
  title: string
  children: React.ReactNode
}

// One item in an AccordionGroup, which decides whether it is open.
export const AccordionItem = ({
  id,
  title,
  children,
}: Props): React.JSX.Element => {
  const { openId, toggle } = useAccordion()
  const isOpen = openId === id
  const panelId = `${id}-panel`

  return (
    <div id={id} className="scroll-mt-20 pt-6">
      <dt>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={isOpen ? panelId : undefined}
          data-open={isOpen ? '' : undefined}
          onClick={(): void => toggle(id)}
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
        </button>
      </dt>
      <Transition show={isOpen}>
        <dd
          id={panelId}
          className="prose mt-2 origin-top overflow-y-auto pr-12 transition duration-200 ease-out data-closed:-translate-y-6 data-closed:opacity-0"
        >
          {children}
        </dd>
      </Transition>
    </div>
  )
}
