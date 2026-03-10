'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'

import type { GuardianFull, GuardianStudentLink } from '@/db'

import { updateGuardianAction } from './actions'

type Props = {
  guardian: GuardianFull
  linkedStudents: GuardianStudentLink[]
}

export default function EditGuardianForm({ guardian, linkedStudents }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    startTransition(async () => {
      const result = await updateGuardianAction(guardian.id, new FormData(form))
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Guardian Details
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="First name"
              name="first_name"
              required
              defaultValue={guardian.first_name}
            />
            <Field
              label="Last name"
              name="last_name"
              required
              defaultValue={guardian.last_name}
            />
            <Field
              label="Phone"
              name="phone"
              type="tel"
              required
              defaultValue={guardian.phone}
            />
            <Field
              label="Email"
              name="email"
              type="email"
              defaultValue={guardian.email ?? undefined}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Address line 1"
              name="address_line_1"
              defaultValue={guardian.address_line_1 ?? undefined}
            />
            <Field
              label="Address line 2"
              name="address_line_2"
              defaultValue={guardian.address_line_2 ?? undefined}
            />
            <Field
              label="City"
              name="city"
              defaultValue={guardian.city ?? undefined}
            />
            <Field
              label="Postcode"
              name="postcode"
              defaultValue={guardian.postcode ?? undefined}
            />
          </div>

          <div className="mt-4">
            <Field
              label="Notes"
              name="notes"
              defaultValue={guardian.notes ?? undefined}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
          <Link
            href="/portal/students"
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Back to students
          </Link>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </form>

      {/* ── Linked Students ──────────────────────────────────────────── */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Linked Students
        </h2>
        {linkedStudents.length === 0 ? (
          <p className="text-sm text-gray-400">No students linked.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {linkedStudents.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-900">
                  {s.last_name}, {s.first_name}
                  {s.student_code && (
                    <span className="ml-2 text-gray-400">
                      ({s.student_code})
                    </span>
                  )}
                </span>
                <Link
                  href={`/portal/students/${s.id}/edit`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
  defaultValue,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  defaultValue?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  )
}
