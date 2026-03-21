'use client'
import { createContext, useContext, useState } from 'react'
import { ArrowDownIcon } from '@heroicons/react/24/outline'

const ExpandableContext = createContext({
  isExpanded: false,
  expand: () => {},
})

export const Expandable = (props: React.ComponentPropsWithoutRef<'div'>) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <ExpandableContext.Provider
      value={{
        isExpanded,
        expand: () => {
          setIsExpanded(true)
        },
      }}
    >
      <div {...props} data-expanded={isExpanded ? '' : undefined} />
    </ExpandableContext.Provider>
  )
}

export const ExpandableItems = ({
  children,
}: {
  children: React.ReactNode
  limit?: number
}) => {
  const { isExpanded } = useContext(ExpandableContext)
  return isExpanded ? children : null
}

export const ExpandableButton = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { isExpanded, expand } = useContext(ExpandableContext)
  return (
    !isExpanded && (
      <div className="mt-10 flex justify-center">
        <button
          type="button"
          className="flex items-center text-base font-medium tracking-tight text-slate-900 hover:text-slate-700"
          onClick={expand}
        >
          {children}
          <ArrowDownIcon className="ml-2 h-6 w-6" />
        </button>
      </div>
    )
  )
}
