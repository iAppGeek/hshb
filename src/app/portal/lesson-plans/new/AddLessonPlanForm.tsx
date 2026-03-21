'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'

import { createLessonPlanAction } from '../actions'

type ClassSummary = { id: string; name: string; year_group: string }

type Props = {
  classes: ClassSummary[]
}

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

export default function AddLessonPlanForm({ classes }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    startTransition(async () => {
      const result = await createLessonPlanAction(new FormData(form))
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Lesson Plan Details
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="class_id"
              className="block text-sm font-medium text-gray-700"
            >
              Class<span className="ml-0.5 text-red-500">*</span>
            </label>
            <select
              id="class_id"
              name="class_id"
              required
              defaultValue={classes.length === 1 ? classes[0].id : ''}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              {classes.length !== 1 && (
                <option value="" disabled>
                  Select a class…
                </option>
              )}
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.year_group})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="lesson_date"
              className="block text-sm font-medium text-gray-700"
            >
              Lesson date<span className="ml-0.5 text-red-500">*</span>
            </label>
            <input
              id="lesson_date"
              name="lesson_date"
              type="date"
              required
              defaultValue={todayDate()}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Lesson description<span className="ml-0.5 text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              maxLength={300}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Add Lesson Plan'}
        </button>
        <Link
          href="/portal/lesson-plans"
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Cancel
        </Link>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </form>
  )
}
