'use client'

import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import {
  Menu,
  MenuButton,
  MenuHeading,
  MenuItem,
  MenuItems,
  MenuSection,
  MenuSeparator,
} from '@headlessui/react'
import clsx from 'clsx'

import { formatEmailsAsCsv } from '@/lib/mailto'

export type StaffEmailGroupProps = {
  emails: string[]
  mailtoHref: string | null
}

export type StaffEmailDropdownProps = {
  teachers: StaffEmailGroupProps
  allStaff: StaffEmailGroupProps
  triggerClassName: string
  /** When the whole control is disabled (no recipients in either group). */
  emptyReason?: string
  mailtoUnavailableReason?: string
  menuAnchor?: 'bottom start' | 'bottom end'
}

const itemClass =
  'group flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 data-focus:bg-gray-100 data-disabled:cursor-not-allowed data-disabled:opacity-50'

const headingClass =
  'px-3 py-1.5 text-xs font-medium tracking-wide text-gray-500 uppercase'

export default function StaffEmailDropdown({
  teachers,
  allStaff,
  triggerClassName,
  emptyReason = 'No email addresses available.',
  mailtoUnavailableReason = 'Too many addresses for your email app. Use copy instead.',
  menuAnchor = 'bottom end',
}: StaffEmailDropdownProps) {
  const [copiedTeachers, setCopiedTeachers] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false)
  const [copyTeachersError, setCopyTeachersError] = useState(false)
  const [copyAllError, setCopyAllError] = useState(false)

  const hasTeachers = teachers.emails.length > 0
  const hasAll = allStaff.emails.length > 0
  const disabled = !hasTeachers && !hasAll

  const teachersCsv = formatEmailsAsCsv(teachers.emails)
  const allCsv = formatEmailsAsCsv(allStaff.emails)

  async function copyTeachers() {
    setCopyTeachersError(false)
    try {
      await navigator.clipboard.writeText(teachersCsv)
      setCopiedTeachers(true)
      window.setTimeout(() => setCopiedTeachers(false), 2000)
    } catch {
      setCopyTeachersError(true)
    }
  }

  async function copyAll() {
    setCopyAllError(false)
    try {
      await navigator.clipboard.writeText(allCsv)
      setCopiedAll(true)
      window.setTimeout(() => setCopiedAll(false), 2000)
    } catch {
      setCopyAllError(true)
    }
  }

  if (disabled) {
    return (
      <span
        className={clsx(triggerClassName, 'cursor-not-allowed opacity-50')}
        title={emptyReason}
      >
        Email staff
      </span>
    )
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton
        type="button"
        className={clsx(
          triggerClassName,
          'inline-flex items-center gap-1 data-active:opacity-90 data-hover:opacity-90',
        )}
      >
        Email staff
        <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
      </MenuButton>

      <MenuItems
        transition
        anchor={menuAnchor}
        modal={false}
        className="z-100 min-w-[16rem] origin-top rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 transition duration-100 ease-out [--anchor-gap:4px] data-closed:scale-95 data-closed:opacity-0"
      >
        <MenuSection>
          <MenuHeading className={headingClass}>
            Teachers &amp; headteachers
          </MenuHeading>
          <MenuItem disabled={!hasTeachers}>
            <button type="button" className={itemClass} onClick={copyTeachers}>
              {copiedTeachers
                ? 'Copied'
                : copyTeachersError
                  ? 'Copy failed — try again'
                  : 'Copy emails (CSV)'}
            </button>
          </MenuItem>
          <MenuItem disabled={!hasTeachers || teachers.mailtoHref == null}>
            {hasTeachers && teachers.mailtoHref ? (
              <a
                href={teachers.mailtoHref}
                className={itemClass}
                onClick={(e) => e.stopPropagation()}
              >
                Open in default email app
              </a>
            ) : (
              <span
                className={itemClass}
                title={
                  !hasTeachers
                    ? 'No teacher or headteacher emails on this list.'
                    : mailtoUnavailableReason
                }
              >
                Open in default email app
              </span>
            )}
          </MenuItem>
        </MenuSection>

        <MenuSeparator className="my-1 border-t border-gray-100" />

        <MenuSection>
          <MenuHeading className={headingClass}>All staff</MenuHeading>
          <MenuItem disabled={!hasAll}>
            <button type="button" className={itemClass} onClick={copyAll}>
              {copiedAll
                ? 'Copied'
                : copyAllError
                  ? 'Copy failed — try again'
                  : 'Copy emails (CSV)'}
            </button>
          </MenuItem>
          <MenuItem disabled={!hasAll || allStaff.mailtoHref == null}>
            {hasAll && allStaff.mailtoHref ? (
              <a
                href={allStaff.mailtoHref}
                className={itemClass}
                onClick={(e) => e.stopPropagation()}
              >
                Open in default email app
              </a>
            ) : (
              <span
                className={itemClass}
                title={
                  !hasAll
                    ? 'No staff emails on this list.'
                    : mailtoUnavailableReason
                }
              >
                Open in default email app
              </span>
            )}
          </MenuItem>
        </MenuSection>
      </MenuItems>
    </Menu>
  )
}
