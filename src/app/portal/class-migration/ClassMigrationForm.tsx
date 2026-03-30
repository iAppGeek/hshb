'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import type { ActionResult } from '@/lib/schemas'

export type MigrationClass = {
  id: string
  name: string
  year_group: string
  academic_year: string | null
}

export type MigrationTeacher = {
  id: string
  first_name: string
  last_name: string
  display_name: string | null
}

export type MigrationStudent = {
  id: string
  first_name: string
  last_name: string
}

type Props = {
  classes: MigrationClass[]
  teachers: MigrationTeacher[]
  sourceClassId: string | null
  students: MigrationStudent[]
  action: (formData: FormData) => Promise<ActionResult>
}

export default function ClassMigrationForm({
  classes,
  teachers,
  sourceClassId,
  students,
  action,
}: Props): React.ReactElement {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSourceChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    const value = e.target.value
    if (value) {
      router.push(`/portal/class-migration?sourceClassId=${value}`)
    } else {
      router.push('/portal/class-migration')
    }
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>): void {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    startTransition(async () => {
      const result = await action(new FormData(form))
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Section 1: Source Class ──────────────────────────────────── */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Source Class
        </h2>

        <div>
          <label
            htmlFor="source_class_select"
            className="block text-sm font-medium text-gray-700"
          >
            Class to migrate<span className="ml-0.5 text-red-500">*</span>
          </label>
          <select
            id="source_class_select"
            value={sourceClassId ?? ''}
            onChange={handleSourceChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select a class…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.academic_year ? ` (${c.academic_year})` : ''}
              </option>
            ))}
          </select>
        </div>

        {sourceClassId && (
          <>
            <input type="hidden" name="source_class_id" value={sourceClassId} />
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Students in this class ({students.length})
              </p>
              {students.length === 0 ? (
                <p className="text-sm text-gray-400">No students enrolled.</p>
              ) : (
                <ul
                  data-testid="student-list"
                  className="divide-y divide-gray-100 rounded-lg border border-gray-200"
                >
                  {students.map((s) => (
                    <li key={s.id} className="px-4 py-2 text-sm text-gray-700">
                      {s.last_name}, {s.first_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Section 2: New Class Details ─────────────────────────────── */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          New Class Details
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Class name" name="name" required />
          <Field label="Year group" name="year_group" required />
          <Field label="Room number" name="room_number" />
          <Field
            label="Academic year"
            name="academic_year"
            required
            placeholder="e.g. 2026/27"
          />
          <div className="sm:col-span-2">
            <label
              htmlFor="teacher_id"
              className="block text-sm font-medium text-gray-700"
            >
              Teacher<span className="ml-0.5 text-red-500">*</span>
            </label>
            <select
              id="teacher_id"
              name="teacher_id"
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select a teacher…</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.last_name}, {t.first_name}
                  {t.display_name ? ` (${t.display_name})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Actions ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending || !sourceClassId}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? 'Migrating…' : 'Migrate Class'}
        </button>
        <Link
          href="/portal/classes"
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
  required = false,
  placeholder,
}: {
  label: string
  name: string
  required?: boolean
  placeholder?: string
}): React.ReactElement {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        required={required}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  )
}
