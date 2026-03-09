'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

type Class = { id: string; name: string }

type Props = {
  classes: Class[]
  selectedClassId: string | null
  selectedDate: string
}

export default function AttendanceFilters({
  classes,
  selectedClassId,
  selectedDate,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function navigate(classId: string | null, date: string) {
    const params = new URLSearchParams()
    if (classId) params.set('classId', classId)
    params.set('date', date)
    startTransition(() => {
      router.push(`/portal/attendance?${params}`)
    })
  }

  function handleDateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const date =
      (new FormData(e.currentTarget).get('date') as string) ?? selectedDate
    navigate(selectedClassId, date)
  }

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
      {/* Class selector */}
      <div>
        <label className="mb-1 block text-xs font-medium tracking-wide text-gray-500 uppercase">
          Class
        </label>
        <div className="flex flex-wrap gap-2">
          {classes.map((cls) => (
            <button
              key={cls.id}
              type="button"
              onClick={() => navigate(cls.id, selectedDate)}
              disabled={isPending}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-60 ${
                cls.id === selectedClassId
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
              }`}
            >
              {cls.name}
            </button>
          ))}
        </div>
      </div>

      {/* Date picker */}
      <div>
        <label
          htmlFor="date-picker"
          className="mb-1 block text-xs font-medium tracking-wide text-gray-500 uppercase"
        >
          Date
        </label>
        <form onSubmit={handleDateSubmit}>
          <div className="flex gap-2">
            <input
              id="date-picker"
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
    </div>
  )
}
