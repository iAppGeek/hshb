'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export type ReportMode = 'day' | 'month' | 'range'

type Props = {
  mode: ReportMode
  date: string
  month: string
  from: string
  to: string
}

const modes: { value: ReportMode; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'month', label: 'Month' },
  { value: 'range', label: 'Range' },
]

export default function ReportsModeSelector({
  mode,
  date,
  month,
  from,
  to,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function navigate(params: Record<string, string>) {
    const qs = new URLSearchParams(params).toString()
    startTransition(() => {
      router.push(`/portal/reports?${qs}`)
    })
  }

  function handleModeChange(newMode: ReportMode) {
    if (newMode === mode) return
    if (newMode === 'day') {
      navigate({ mode: 'day', date })
    } else if (newMode === 'month') {
      navigate({ mode: 'month', month })
    } else {
      navigate({ mode: 'range', from, to })
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (mode === 'day') {
      navigate({ mode: 'day', date: (fd.get('date') as string) ?? date })
    } else if (mode === 'month') {
      navigate({
        mode: 'month',
        month: (fd.get('month') as string) ?? month,
      })
    } else {
      navigate({
        mode: 'range',
        from: (fd.get('from') as string) ?? from,
        to: (fd.get('to') as string) ?? to,
      })
    }
  }

  const inputClass =
    'rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
  const labelClass =
    'mb-1 block text-xs font-medium tracking-wide text-gray-500 uppercase'

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
      {/* Mode buttons */}
      <div>
        <span className={labelClass}>View</span>
        <div className="flex gap-1">
          {modes.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => handleModeChange(m.value)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                m.value === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date inputs */}
      <form onSubmit={handleSubmit}>
        <div className="flex items-end gap-2">
          {mode === 'day' && (
            <div>
              <label htmlFor="report-date" className={labelClass}>
                Date
              </label>
              <input
                id="report-date"
                type="date"
                name="date"
                defaultValue={date}
                className={inputClass}
              />
            </div>
          )}

          {mode === 'month' && (
            <div>
              <label htmlFor="report-month" className={labelClass}>
                Month
              </label>
              <input
                id="report-month"
                type="month"
                name="month"
                defaultValue={month}
                className={inputClass}
              />
            </div>
          )}

          {mode === 'range' && (
            <>
              <div>
                <label htmlFor="report-from" className={labelClass}>
                  From
                </label>
                <input
                  id="report-from"
                  type="date"
                  name="from"
                  defaultValue={from}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="report-to" className={labelClass}>
                  To
                </label>
                <input
                  id="report-to"
                  type="date"
                  name="to"
                  defaultValue={to}
                  className={inputClass}
                />
              </div>
            </>
          )}

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
