'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'

import type { LessonPlanRow } from '@/db'

import { updateLessonPlanAction } from '../../actions'

type Props = {
  plan: LessonPlanRow
}

export default function EditLessonPlanForm({ plan }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    startTransition(async () => {
      const result = await updateLessonPlanAction(plan.id, new FormData(form))
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
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
            <span className="font-medium text-gray-700">Class: </span>
            {plan.class.name} ({plan.class.year_group})
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
              defaultValue={plan.lesson_date}
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
              defaultValue={plan.description}
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
          {isPending ? 'Saving…' : 'Save changes'}
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
