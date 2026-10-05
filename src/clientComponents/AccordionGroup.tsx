'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react'

type AccordionContextValue = {
  openId: string | null
  toggle: (id: string) => void
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

export const useAccordion = (): AccordionContextValue => {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error('AccordionItem must be rendered inside an AccordionGroup')
  }
  return context
}

const noopSubscribe = (): (() => void) => (): void => {}

// False during SSR and hydration, true once hydrated on the client.
const useIsHydrated = (): boolean =>
  useSyncExternalStore(
    noopSubscribe,
    (): boolean => true,
    (): boolean => false,
  )

const currentHashId = (): string => {
  const hash = window.location.hash.slice(1)
  try {
    return decodeURIComponent(hash)
  } catch {
    return hash
  }
}

// Not checking defaultPrevented: next/link prevents default on every click.
const isPlainLeftClick = (event: MouseEvent): boolean =>
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey

// True when the clicked link points at the URL we're already on, hash
// included — the browser fires no hashchange for those.
const linksToCurrentUrl = (target: EventTarget | null): boolean => {
  const link = target instanceof Element ? target.closest('a[href]') : null
  if (!(link instanceof HTMLAnchorElement)) return false

  const url = new URL(link.href, window.location.href)
  return url.href === window.location.href && url.hash !== ''
}

type Props = {
  ids: string[]
  className?: string
  children: React.ReactNode
}

// Owns which accordion item is open. An item whose id matches the URL hash is
// opened (never toggled) and the others closed, so items can be linked to
// directly, e.g. /#faq-term-dates.
export const AccordionGroup = ({
  ids,
  className,
  children,
}: Props): React.JSX.Element => {
  const [openId, setOpenId] = useState<string | null>(null)
  const isHydrated = useIsHydrated()

  useEffect((): (() => void) => {
    const openFromHash = (): void => {
      const id = currentHashId()
      if (!ids.includes(id)) return

      setOpenId(id)
      document.getElementById(id)?.scrollIntoView({ block: 'start' })
    }

    const onClick = (event: MouseEvent): void => {
      if (isPlainLeftClick(event) && linksToCurrentUrl(event.target)) {
        openFromHash()
      }
    }

    openFromHash()
    window.addEventListener('hashchange', openFromHash)
    document.addEventListener('click', onClick)
    return (): void => {
      window.removeEventListener('hashchange', openFromHash)
      document.removeEventListener('click', onClick)
    }
  }, [ids])

  const toggle = (id: string): void => {
    setOpenId((current): string | null => (current === id ? null : id))
  }

  return (
    <AccordionContext.Provider value={{ openId, toggle }}>
      <dl className={className} data-ready={isHydrated ? '' : undefined}>
        {children}
      </dl>
    </AccordionContext.Provider>
  )
}
