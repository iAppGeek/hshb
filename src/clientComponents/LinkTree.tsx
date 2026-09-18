'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import clsx from 'clsx'

import instagramIcon from '@/images/icons/instagram.svg'
import facebookIcon from '@/images/icons/facebook.svg'
import twitterIcon from '@/images/icons/twitter.svg'
import logo from '@/images/logo.png'
import { sendEvent } from '@/data/events'
import { buildContactMailto, LINKS, SOCIAL_LINKS } from '@/data/linktree'

const SOCIAL_ICONS: Record<string, string> = {
  instagram: instagramIcon,
  facebook: facebookIcon,
  x: twitterIcon,
}

const linkClassName = clsx(
  'flex min-h-11 w-full items-center justify-center rounded-full bg-white px-4 text-center',
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

  return (
    <main className="relative flex min-h-dvh justify-center bg-slate-100 sm:items-center sm:p-4">
      <div
        className={clsx(
          'relative h-dvh w-full overflow-hidden bg-linear-to-b from-blue-700 via-blue-500 to-blue-50',
          'sm:h-[min(calc(100dvh-2rem),56rem)] sm:max-w-md sm:rounded-[2.5rem] sm:shadow-xl',
        )}
      >
        <div className="relative z-10 flex h-full flex-col items-center px-6 pt-[8vh]">
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
            {LINKS.map((link) =>
              link.external ? (
                <li key={link.id}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClassName}
                    onClick={() => trackClick(link.id)}
                  >
                    {link.label}
                  </a>
                </li>
              ) : (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className={linkClassName}
                    onClick={() => trackClick(link.id)}
                  >
                    {link.label}
                  </Link>
                </li>
              ),
            )}
            <li>
              <a
                href={contactHref}
                className={linkClassName}
                onClick={() => trackClick('email-school')}
              >
                Contact / Email School
              </a>
            </li>
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
          Placeholder for a primary-school / education themed decorative
          illustration. Swap this block for a <next/image> once
          src/images/linktree/corner-illustration.webp is provided.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 z-0 flex max-h-[26dvh] w-[55%] items-end justify-end p-4 [@media(max-height:680px)]:max-h-[18dvh]"
        >
          <div className="flex aspect-4/3 w-full items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-white/40">
            <span className="text-xs font-medium text-blue-400">Image</span>
          </div>
        </div>
      </div>
    </main>
  )
}
