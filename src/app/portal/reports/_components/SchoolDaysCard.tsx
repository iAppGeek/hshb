'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

import { formatCalendarDate } from '@/lib/datetime'

export type SchoolDayDate = {
  date: string
  staffCount: number
  attendanceCount: number
}

type Props = {
  totalSchoolDays: number
  dates: SchoolDayDate[]
}

function formatDateFull(dateStr: string): string {
  return formatCalendarDate(dateStr, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export default function SchoolDaysCard({ totalSchoolDays, dates }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <div className="group relative">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-200 transition hover:ring-blue-300 sm:p-6"
        >
          <p className="text-sm text-gray-500">School days</p>
          <p className="mt-1 flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {totalSchoolDays}
            </span>
            <span className="text-xs text-blue-500">View dates</span>
          </p>
        </button>
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
        >
          Dates where attendance was taken or staff signed in
        </span>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-sm flex-col rounded-xl bg-white shadow-xl ring-1 ring-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                School Days ({totalSchoolDays})
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <ul className="flex-1 divide-y divide-gray-100 overflow-y-auto px-6 py-2">
              {dates.map((d) => (
                <li
                  key={d.date}
                  className="flex items-center justify-between py-2 text-sm text-gray-700"
                >
                  <span className="flex items-center gap-2">
                    <span>{formatDateFull(d.date)}</span>
                    <span className="group/staff relative">
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                        ({d.staffCount})
                      </span>
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover/staff:opacity-100"
                      >
                        Staff sign-in records
                      </span>
                    </span>
                    <span className="group/att relative">
                      <span className="rounded bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700">
                        ({d.attendanceCount})
                      </span>
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover/att:opacity-100"
                      >
                        Attendance records
                      </span>
                    </span>
                  </span>
                  <span className="text-xs text-gray-400">{d.date}</span>
                </li>
              ))}
              {dates.length === 0 && (
                <li className="py-4 text-center text-sm text-gray-400">
                  No school days in this period
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
