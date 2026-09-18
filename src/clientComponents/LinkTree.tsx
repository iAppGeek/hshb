'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, type ReactNode } from 'react'
import clsx from 'clsx'
import {
  EnvelopeIcon,
  GlobeAltIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'

import classdojoIcon from '@/images/icons/classdojo-icon.svg'
import instagramIcon from '@/images/icons/instagram.svg'
import facebookIcon from '@/images/icons/facebook.svg'
import twitterIcon from '@/images/icons/twitter.svg'
import logo from '@/images/logo.png'
import { sendEvent } from '@/data/events'
import { buildContactMailto, LINKS, SOCIAL_LINKS } from '@/data/linktree'

const SOCIAL_ICONS: Record<string, string> = {
  'dojo-parent-login': classdojoIcon,
  instagram: instagramIcon,
  facebook: facebookIcon,
  x: twitterIcon,
}

// Icons for the main pill links, keyed by link id. ClassDojo uses the same
// brand icon as its social-row counterpart; the rest use heroicons matching
// their function.
const LINK_ICONS: Record<string, ReactNode> = {
  homepage: <GlobeAltIcon aria-hidden="true" className="size-5" />,
  registration: <UserPlusIcon aria-hidden="true" className="size-5" />,
  'dojo-school-signup': (
    <Image
      src={classdojoIcon}
      alt=""
      aria-hidden="true"
      height={20}
      width={20}
    />
  ),
}

const linkClassName = clsx(
  'flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-4 text-center',
  'text-base font-medium text-slate-900 shadow-md transition-colors hover:bg-blue-50',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
  '[@media(max-height:680px)]:min-h-9 [@media(max-height:680px)]:text-sm',
)

type LinkTreeProps = {
  staff: string | null
  staffEmail: string | null
}

export const LinkTree = ({ staff, staffEmail }: LinkTreeProps) => {
  const viewSentRef = useRef(false)

  useEffect(() => {
    if (viewSentRef.current) return
    viewSentRef.current = true
    sendEvent('view', 'linktree-view', { staff: staff ?? 'none' })
  }, [staff])

  const trackClick = (linkId: string): void => {
    sendEvent('click', 'linktree-link', {
      link: linkId,
      staff: staff ?? 'none',
    })
  }

  const contactHref = buildContactMailto(staffEmail)

  // Renders in the requested order: Visit Website, Contact Us, Register
  // Student, ClassDojo Family Registration. Contact Us is spliced in after
  // the homepage link since its href is built at runtime, not stored in
  // the static LINKS list.
  const [homepageLink, ...restLinks] = LINKS

  return (
    <main className="relative flex min-h-dvh justify-center bg-slate-100 sm:items-center sm:p-4">
      <div
        className={clsx(
          'relative flex h-dvh w-full flex-col overflow-hidden bg-linear-to-b from-blue-700 via-blue-500 to-blue-50',
          // From `sm:` up, the card keeps a phone-like aspect ratio (rather
          // than a fixed max-width) so there's always proportionally enough
          // height for the content above the decorative image, even on a
          // short, wide desktop viewport.
          'sm:aspect-9/19 sm:h-[min(calc(100dvh-2rem),44rem)] sm:w-auto sm:rounded-[2.5rem] sm:shadow-xl',
        )}
      >
        <div className="relative z-10 flex flex-col items-center px-6 pt-[8vh]">
          <div
            className={clsx(
              'flex size-24 items-center justify-center rounded-full bg-white p-3 shadow-lg ring-4 ring-white/40',
              '[@media(max-height:680px)]:size-16',
            )}
          >
            <Image
              src={logo}
              alt="Hellenic School of High Barnet logo"
              className="h-full w-full object-contain"
              priority
            />
          </div>

          <h1 className="font-display mt-4 text-center text-xl font-bold text-white">
            Hellenic School of High Barnet
          </h1>
          <p className="mt-1 text-center text-sm text-blue-50/90">
            Greek language school in Cockfosters since 1977
          </p>
          {staffEmail && (
            <p className="mt-1 text-center text-xs text-blue-100">
              Shared by {staffEmail}
            </p>
          )}

          <ul
            className={clsx(
              'mt-6 flex w-full max-w-sm flex-col gap-3',
              '[@media(max-height:680px)]:mt-4 [@media(max-height:680px)]:gap-2',
            )}
          >
            <li>
              <Link
                href={homepageLink.href}
                className={linkClassName}
                onClick={() => trackClick(homepageLink.id)}
              >
                {LINK_ICONS[homepageLink.id]}
                {homepageLink.label}
              </Link>
            </li>
            <li>
              <a
                href={contactHref}
                className={linkClassName}
                onClick={() => trackClick('email-school')}
              >
                <EnvelopeIcon aria-hidden="true" className="size-5" />
                Contact Us
              </a>
            </li>
            {restLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClassName}
                  onClick={() => trackClick(link.id)}
                >
                  {LINK_ICONS[link.id]}
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-center gap-4">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                title={social.label}
                className="flex size-11 items-center justify-center rounded-full bg-white shadow-md hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={() => trackClick(social.id)}
              >
                <span className="sr-only">{social.label}</span>
                <Image
                  src={SOCIAL_ICONS[social.id]}
                  alt=""
                  aria-hidden="true"
                  height={20}
                  width={20}
                />
              </a>
            ))}
          </div>
        </div>

        {/*
          Reserves the remaining card height (whatever that is, at any
          viewport) for a primary-school / education themed decorative
          illustration, so it can never overlap the content above. Swap
          this placeholder for a <next/image> once
          src/images/linktree/corner-illustration.webp is provided.
        */}
        <div className="relative min-h-0 flex-1">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-end justify-end p-4"
          >
            <div className="flex aspect-4/3 h-full max-h-40 w-auto max-w-[70%] items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-white/40">
              <span className="text-xs font-medium text-blue-400">Image</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
