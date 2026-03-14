'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Link from 'next/link'

import type { IncidentType } from '@/db'

import { createIncidentAction } from '../actions'

type StudentSummary = { id: string; first_name: string; last_name: string }

type Props = {
  students: StudentSummary[]
  staffId: string
  type: IncidentType
}

function localNow() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}

export default function AddIncidentForm({ students, type }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [studentId, setStudentId] = useState('')
  const [parentNotified, setParentNotified] = useState(false)

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!studentId) {
      setError('Please select a student.')
      return
    }
    setError(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    fd.set('student_id', studentId)
    fd.set('parent_notified', String(parentNotified))
    startTransition(async () => {
      const result = await createIncidentAction(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">
          Incident Details
        </h2>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Type<span className="ml-0.5 text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              required
              defaultValue={type}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="medical">Medical</option>
              <option value="behaviour">Behaviour</option>
              <option value="other">Other</option>
            </select>
          </div>

          <StudentSearch students={students} onSelect={setStudentId} />

          <Field label="Title" name="title" required />

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
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <Field
            label="Incident date & time"
            name="incident_date"
            type="datetime-local"
            required
            defaultValue={localNow()}
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
              defaultValue={localNow()}
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
          {isPending ? 'Saving…' : 'Add Incident'}
        </button>
        <Link
          href={`/portal/incidents?tab=${type}`}
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Cancel
        </Link>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </form>
  )
}

function StudentSearch({
  students,
  onSelect,
}: {
  students: StudentSummary[]
  onSelect: (id: string) => void
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<StudentSummary | null>(null)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const sorted = [...students].sort((a, b) =>
    a.last_name.localeCompare(b.last_name),
  )

  const filtered = search.trim()
    ? sorted.filter((s) =>
        `${s.last_name} ${s.first_name}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    : sorted

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function select(student: StudentSummary) {
    setSelected(student)
    onSelect(student.id)
    setSearch('')
    setOpen(false)
  }

  function clear() {
    setSelected(null)
    onSelect('')
    setSearch('')
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700">
        Student<span className="ml-0.5 text-red-500">*</span>
      </label>

      {selected ? (
        <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm">
          <span className="flex-1 text-gray-900">
            {selected.last_name}, {selected.first_name}
          </span>
          <button
            type="button"
            onClick={clear}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Clear student selection"
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            autoComplete="off"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          {open && filtered.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {filtered.slice(0, 30).map((s) => (
                <li
                  key={s.id}
                  onMouseDown={() => select(s)}
                  className="cursor-pointer px-3 py-2 text-sm text-gray-900 hover:bg-blue-50"
                >
                  {s.last_name}, {s.first_name}
                </li>
              ))}
            </ul>
          )}
          {open && search.trim() && filtered.length === 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-lg">
              No students found.
            </div>
          )}
        </>
      )}
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
