'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

type Props = {
  selectedDate: string
}

export default function StaffAttendanceDatePicker({ selectedDate }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const date =
      (new FormData(e.currentTarget).get('date') as string) ?? selectedDate
    startTransition(() => {
      router.push(`/portal/staff-attendance?date=${date}`)
    })
  }

  return (
    <div>
      <label
        htmlFor="staff-date-picker"
        className="mb-1 block text-xs font-medium tracking-wide text-gray-500 uppercase"
      >
        Date
      </label>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <input
            id="staff-date-picker"
            type="date"
            name="date"
            defaultValue={selectedDate}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50 disabled:opacity-60"
          >
            {isPending ? 'Loading…' : 'Load'}
          </button>
        </div>
      </form>
    </div>
  )
}
