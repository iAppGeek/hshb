'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import clsx from 'clsx'

import { formatEmailsAsCsv } from '@/lib/mailto'

export type BulkEmailDropdownProps = {
  emails: string[]
  mailtoHref: string | null
  buttonLabel: string
  /** When there are no addresses (trigger disabled). */
  emptyReason?: string
  /** When mailto is unavailable but copy still works. */
  mailtoUnavailableReason?: string
  triggerClassName: string
  /** Anchor for the floating menu panel. */
  menuAnchor?: 'bottom start' | 'bottom end'
}

export default function BulkEmailDropdown({
  emails,
  mailtoHref,
  buttonLabel,
  emptyReason = 'No email addresses available.',
  mailtoUnavailableReason = 'Too many addresses for your email app. Use copy instead.',
  triggerClassName,
  menuAnchor = 'bottom end',
}: BulkEmailDropdownProps) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)

  const disabled = emails.length === 0
  const csv = formatEmailsAsCsv(emails)

  async function handleCopyCsv() {
    setCopyError(false)
    try {
      await navigator.clipboard.writeText(csv)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopyError(true)
    }
  }

  if (disabled) {
    return (
      <span
        className={clsx(triggerClassName, 'cursor-not-allowed opacity-50')}
        title={emptyReason}
      >
        {buttonLabel}
      </span>
    )
  }

  const itemClass =
    'group flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100 data-disabled:cursor-not-allowed data-disabled:opacity-50'

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        type="button"
        className={clsx(
          triggerClassName,
          'inline-flex items-center gap-1 data-active:opacity-90 data-hover:opacity-90',
        )}
      >
        {buttonLabel}
        <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
      </MenuButton>

      <MenuItems
        transition
        anchor={menuAnchor}
        modal={false}
        className="z-[100] min-w-[14rem] origin-top rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 transition duration-100 ease-out [--anchor-gap:4px] data-closed:scale-95 data-closed:opacity-0"
      >
        <MenuItem>
          <button type="button" className={itemClass} onClick={handleCopyCsv}>
            {copied
              ? 'Copied'
              : copyError
                ? 'Copy failed — try again'
                : 'Copy emails (CSV)'}
          </button>
        </MenuItem>
        <MenuItem disabled={mailtoHref == null}>
          {mailtoHref ? (
            <a
              href={mailtoHref}
              className={itemClass}
              onClick={(e) => e.stopPropagation()}
            >
              Open in default email app
            </a>
          ) : (
            <span className={itemClass} title={mailtoUnavailableReason}>
              Open in default email app
            </span>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  )
}
