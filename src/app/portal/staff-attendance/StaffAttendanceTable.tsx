'use client'

import { useTransition, useState } from 'react'

import type { StaffAttendanceRow } from '@/db'

import { signInAction, signOutAction } from './actions'
import { fmtTime } from './utils'

export type StaffMember = {
  id: string
  first_name: string
  last_name: string
  display_name: string | null
  class_name: string | null
  room_number: string | null
}

export type TableRow = {
  staff: StaffMember
  record: StaffAttendanceRow | null
}

function StatusBadge({ record }: { record: StaffAttendanceRow | null }) {
  if (!record) return <span className="text-gray-400">—</span>
  if (record.signed_out_at) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
        In {fmtTime(record.signed_in_at)} · Out {fmtTime(record.signed_out_at)}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
      Signed In {fmtTime(record.signed_in_at)}
    </span>
  )
}

function StaffRowInteractive({
  staff,
  record,
  defaultTime,
  date,
}: {
  staff: StaffMember
  record: StaffAttendanceRow | null
  defaultTime: string
  date: string
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const isSignedIn = !!record && !record.signed_out_at
  const name = staff.display_name ?? `${staff.first_name} ${staff.last_name}`

  function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await signInAction(fd)
      if (result?.error) setError(result.error)
    })
  }

  function handleSignOut(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await signOutAction(fd)
      if (result?.error) setError(result.error)
    })
  }

  const actionForm = isSignedIn ? (
    <form onSubmit={handleSignOut} className="flex items-center gap-2">
      <input type="hidden" name="staffId" value={staff.id} />
      <input type="hidden" name="date" value={date} />
      <input
        type="time"
        name="time"
        defaultValue={defaultTime}
        required
        disabled={isPending}
        className="min-w-0 flex-1 rounded-md border border-gray-200 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60 sm:flex-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-24 shrink-0 rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800 transition hover:bg-amber-200 disabled:opacity-60"
      >
        {isPending ? 'Saving…' : 'Sign Out'}
      </button>
    </form>
  ) : (
    <form onSubmit={handleSignIn} className="flex items-center gap-2">
      <input type="hidden" name="staffId" value={staff.id} />
      <input type="hidden" name="date" value={date} />
      <input
        type="time"
        name="time"
        defaultValue={defaultTime}
        required
        disabled={isPending}
        className="min-w-0 flex-1 rounded-md border border-gray-200 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60 sm:flex-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-24 shrink-0 rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800 transition hover:bg-green-200 disabled:opacity-60"
      >
        {isPending ? 'Saving…' : 'Sign In'}
      </button>
    </form>
  )

  return (
    <tr className="block border-b border-gray-200 last:border-0 hover:bg-gray-50 sm:table-row sm:border-0">
      {/* Name cell — on mobile also shows status (top-right) and room/class (second line) */}
      <td className="block px-4 pt-4 pb-0 sm:table-cell sm:px-6 sm:py-3 sm:align-top">
        <div className="flex items-start justify-between gap-2 sm:block">
          <span className="text-sm font-medium text-gray-900">{name}</span>
          <span className="shrink-0 sm:hidden">
            <StatusBadge record={record} />
          </span>
        </div>
        {(staff.room_number || staff.class_name) && (
          <p className="mt-0.5 text-xs text-gray-500 sm:hidden">
            {[
              staff.room_number && `Room ${staff.room_number}`,
              staff.class_name,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
      </td>

      {/* Action cell */}
      <td className="block px-4 pt-2 pb-4 sm:table-cell sm:px-6 sm:py-3 sm:align-top">
        {error && <p className="mb-1 text-xs text-red-600">{error}</p>}
        {actionForm}
      </td>

      {/* Status — hidden on mobile (rendered inside Name cell), visible on desktop */}
      <td className="hidden sm:table-cell sm:px-6 sm:py-3 sm:align-top">
        <StatusBadge record={record} />
      </td>

      {/* Room — hidden on mobile (rendered inside Name cell), visible on desktop */}
      <td className="hidden text-sm text-gray-600 sm:table-cell sm:px-6 sm:py-3 sm:align-top">
        {staff.room_number ?? '—'}
      </td>

      {/* Class — hidden on mobile (rendered inside Name cell), visible on desktop */}
      <td className="hidden text-sm text-gray-600 sm:table-cell sm:px-6 sm:py-3 sm:align-top">
        {staff.class_name ?? '—'}
      </td>
    </tr>
  )
}

type Props = {
  rows: TableRow[]
  defaultTime: string
  date: string
}

export default function StaffAttendanceTable({
  rows,
  defaultTime,
  date,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="hidden bg-gray-50 sm:table-header-group">
          <tr>
            {['Name', 'Action', 'Status', 'Room', 'Class'].map((h) => (
              <th
                key={h}
                className="px-6 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows.map(({ staff, record }) => (
            <StaffRowInteractive
              key={staff.id}
              staff={staff}
              record={record}
              defaultTime={defaultTime}
              date={date}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
