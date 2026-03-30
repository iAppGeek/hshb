'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'

import { roleDescriptions } from '@/lib/roleLabels'
import type { StaffRole } from '@/types/next-auth'

import { updateStaffAction } from './actions'

type StaffData = {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  display_name: string | null
  contact_number: string | null
  personal_email: string | null
}

const ROLES = [
  { value: 'teacher', label: 'Teacher' },
  { value: 'admin', label: 'Admin' },
  { value: 'headteacher', label: 'Headteacher' },
  { value: 'secretary', label: 'Secretary' },
]

export default function EditStaffForm({ staff }: { staff: StaffData }) {
  const [selectedRole, setSelectedRole] = useState<StaffRole>(
    staff.role as StaffRole,
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    startTransition(async () => {
      const result = await updateStaffAction(staff.id, new FormData(form))
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Staff Details
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="First name"
            name="first_name"
            required
            defaultValue={staff.first_name}
          />
          <Field
            label="Last name"
            name="last_name"
            required
            defaultValue={staff.last_name}
          />
          <Field
            label="Email"
            name="email"
            type="email"
            required
            defaultValue={staff.email}
          />
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role<span className="ml-0.5 text-red-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              required
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as StaffRole)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select a role…</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-sm text-gray-500">
              {roleDescriptions[selectedRole]}
            </p>
          </div>
          <Field
            label="Display name"
            name="display_name"
            defaultValue={staff.display_name ?? undefined}
          />
          <Field
            label="Contact number"
            name="contact_number"
            type="tel"
            defaultValue={staff.contact_number ?? undefined}
          />
          <Field
            label="Personal email"
            name="personal_email"
            type="email"
            defaultValue={staff.personal_email ?? undefined}
          />
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
          href="/portal/staff"
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
