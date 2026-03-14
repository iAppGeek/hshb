'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'

import type { IncidentRow } from '@/db'

import { updateIncidentAction } from '../../actions'

type Props = {
  incident: IncidentRow
}

function localNow() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}

export default function EditIncidentForm({ incident }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [parentNotified, setParentNotified] = useState(
    incident.parent_notified ?? false,
  )

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    fd.set('parent_notified', String(parentNotified))
    startTransition(async () => {
      const result = await updateIncidentAction(incident.id, fd)
      if (result?.error) setError(result.error)
    })
  }

  const defaultDateTime = incident.incident_date
    ? incident.incident_date.slice(0, 16)
    : ''

  const defaultNotifiedAt = incident.parent_notified_at
    ? incident.parent_notified_at.slice(0, 16)
    : localNow()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Incident Details
        </h2>

        <input type="hidden" name="type" value={incident.type} />

        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
            <span className="font-medium text-gray-700">Student: </span>
            {incident.student.last_name}, {incident.student.first_name}
          </div>

          <Field
            label="Title"
            name="title"
            required
            defaultValue={incident.title}
          />

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description<span className="ml-0.5 text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              defaultValue={incident.description}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <Field
            label="Incident date & time"
            name="incident_date"
            type="datetime-local"
            required
            defaultValue={defaultDateTime}
          />
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Parent / Guardian Notification
        </h2>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={parentNotified}
            onChange={(e) => setParentNotified(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Parent / guardian has been notified
          </span>
        </label>

        {parentNotified && (
          <div className="mt-4">
            <Field
              label="Date & time notified"
              name="parent_notified_at"
              type="datetime-local"
              defaultValue={defaultNotifiedAt}
            />
          </div>
        )}
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
          href={`/portal/incidents?tab=${incident.type}`}
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Cancel
        </Link>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </form>
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
