'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'

export type ClassFormTeacher = {
  id: string
  first_name: string
  last_name: string
  display_name: string | null
}

export type ClassFormStudent = {
  id: string
  first_name: string
  last_name: string
  student_code: string | null
}

export type ClassFormData = {
  id: string
  name: string
  year_group: string
  room_number: string | null
  academic_year: string | null
  teacher_id: string | null
  active: boolean
  student_classes: Array<{ student_id: string }>
}

type Props = {
  teachers: ClassFormTeacher[]
  students: ClassFormStudent[]
  classData?: ClassFormData
  action: (formData: FormData) => Promise<{ error: string } | void>
  submitLabel: string
}

const SEARCH_MIN = 2

function filterStudents(
  students: ClassFormStudent[],
  query: string,
): ClassFormStudent[] {
  const q = query.trim().toLowerCase()
  if (q.length < SEARCH_MIN) return students
  return students.filter((s) =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(q),
  )
}

export default function ClassForm({
  teachers,
  students,
  classData,
  action,
  submitLabel,
}: Props) {
  const enrolledIds = new Set(
    classData?.student_classes.map((sc) => sc.student_id) ?? [],
  )
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const sorted = [
    ...students.filter((s) => enrolledIds.has(s.id)),
    ...students.filter((s) => !enrolledIds.has(s.id)),
  ]
  const visible = filterStudents(sorted, search)

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
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
      {/* ── Class Details ─────────────────────────────────────────────── */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Class Details
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Class name"
            name="name"
            required
            defaultValue={classData?.name}
          />
          <Field
            label="Year group"
            name="year_group"
            required
            defaultValue={classData?.year_group}
          />
          <Field
            label="Room number"
            name="room_number"
            defaultValue={classData?.room_number ?? undefined}
          />
          <Field
            label="Academic year"
            name="academic_year"
            placeholder="e.g. 2024/25"
            defaultValue={classData?.academic_year ?? undefined}
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
              defaultValue={classData?.teacher_id ?? ''}
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

          {classData !== undefined && (
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="active"
                name="active"
                type="checkbox"
                defaultChecked={classData.active}
                value="true"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="active"
                className="text-sm font-medium text-gray-700"
              >
                Active
              </label>
            </div>
          )}
        </div>
      </div>

      {/* ── Students ──────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Students</h2>

        <div className="mb-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter students by name…"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {students.length === 0 ? (
          <p className="text-sm text-gray-400">No students found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {visible.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  name="student_ids"
                  value={s.id}
                  defaultChecked={enrolledIds.has(s.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {s.last_name}, {s.first_name}
                {s.student_code && (
                  <span className="text-gray-400">({s.student_code})</span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? 'Saving…' : submitLabel}
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
  type = 'text',
  required = false,
  defaultValue,
  placeholder,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  defaultValue?: string
  placeholder?: string
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
        placeholder={placeholder}
        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  )
}
