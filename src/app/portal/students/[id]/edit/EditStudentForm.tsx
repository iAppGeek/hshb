'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'

import type { GuardianSummary } from '@/db'

import { updateStudentAction } from './actions'

type StudentData = {
  id: string
  first_name: string
  last_name: string
  student_code: string | null
  date_of_birth: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  postcode: string | null
  allergies: string | null
  medical_details: string | null
  notes: string | null
  primary_guardian_id: string | null
  primary_guardian_relationship: string | null
  secondary_guardian_id: string | null
  secondary_guardian_relationship: string | null
  additional_contact_1_id: string | null
  additional_contact_1_relationship: string | null
  additional_contact_2_id: string | null
  additional_contact_2_relationship: string | null
}

type Props = {
  student: StudentData
  guardians: GuardianSummary[]
}

export default function EditStudentForm({ student, guardians }: Props) {
  const [showSecondary, setShowSecondary] = useState(
    Boolean(student.secondary_guardian_id),
  )
  const [showContact1, setShowContact1] = useState(
    Boolean(student.additional_contact_1_id),
  )
  const [showContact2, setShowContact2] = useState(
    Boolean(student.additional_contact_2_id),
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    startTransition(async () => {
      const result = await updateStudentAction(student.id, new FormData(form))
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="has_secondary" value={String(showSecondary)} />
      <input type="hidden" name="has_contact1" value={String(showContact1)} />
      <input type="hidden" name="has_contact2" value={String(showContact2)} />

      {/* ── Student Details ─────────────────────────────────────────── */}
      <FormSection title="Student Details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="First name"
            name="student_first_name"
            required
            defaultValue={student.first_name}
          />
          <Field
            label="Last name"
            name="student_last_name"
            required
            defaultValue={student.last_name}
          />
          <Field
            label="Date of birth"
            name="student_date_of_birth"
            type="date"
            defaultValue={student.date_of_birth ?? undefined}
          />
          <Field
            label="Student code"
            name="student_code"
            defaultValue={student.student_code ?? undefined}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Address line 1"
            name="student_address_line_1"
            required
            defaultValue={student.address_line_1 ?? undefined}
          />
          <Field
            label="Address line 2"
            name="student_address_line_2"
            defaultValue={student.address_line_2 ?? undefined}
          />
          <Field
            label="City"
            name="student_city"
            required
            defaultValue={student.city ?? undefined}
          />
          <Field
            label="Postcode"
            name="student_postcode"
            required
            defaultValue={student.postcode ?? undefined}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Allergies"
            name="student_allergies"
            defaultValue={student.allergies ?? undefined}
          />
          <Field
            label="Medical Details"
            name="student_medical_details"
            defaultValue={student.medical_details ?? undefined}
          />
          <Field
            label="Notes"
            name="student_notes"
            defaultValue={student.notes ?? undefined}
          />
        </div>
      </FormSection>

      {/* ── Primary Guardian ────────────────────────────────────────── */}
      <FormSection title="Primary Guardian">
        <GuardianSelector
          prefix="primary"
          guardians={guardians}
          showAddress
          requireEmail
          defaultId={student.primary_guardian_id ?? undefined}
          defaultRelationship={
            student.primary_guardian_relationship ?? undefined
          }
        />
      </FormSection>

      {/* ── Secondary Guardian ──────────────────────────────────────── */}
      {showSecondary ? (
        <FormSection
          title="Secondary Guardian"
          onRemove={() => setShowSecondary(false)}
        >
          <GuardianSelector
            prefix="secondary"
            guardians={guardians}
            showAddress
            defaultId={student.secondary_guardian_id ?? undefined}
            defaultRelationship={
              student.secondary_guardian_relationship ?? undefined
            }
          />
        </FormSection>
      ) : (
        <button
          type="button"
          onClick={() => setShowSecondary(true)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          + Add secondary guardian
        </button>
      )}

      {/* ── Additional Contacts ─────────────────────────────────────── */}
      {showContact1 ? (
        <FormSection
          title="Additional Contact 1"
          onRemove={() => {
            setShowContact1(false)
            setShowContact2(false)
          }}
        >
          <GuardianSelector
            prefix="contact1"
            guardians={guardians}
            defaultId={student.additional_contact_1_id ?? undefined}
            defaultRelationship={
              student.additional_contact_1_relationship ?? undefined
            }
          />
        </FormSection>
      ) : (
        <button
          type="button"
          onClick={() => setShowContact1(true)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          + Add additional contact
        </button>
      )}

      {showContact1 &&
        (showContact2 ? (
          <FormSection
            title="Additional Contact 2"
            onRemove={() => setShowContact2(false)}
          >
            <GuardianSelector
              prefix="contact2"
              guardians={guardians}
              defaultId={student.additional_contact_2_id ?? undefined}
              defaultRelationship={
                student.additional_contact_2_relationship ?? undefined
              }
            />
          </FormSection>
        ) : (
          <button
            type="button"
            onClick={() => setShowContact2(true)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            + Add second additional contact
          </button>
        ))}

      {/* ── Actions ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
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
          Cancel
        </Link>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </form>
  )
}

const SEARCH_MIN_LENGTH = 5
const SEARCH_MAX_RESULTS = 10

function filterGuardians(
  guardians: GuardianSummary[],
  query: string,
): GuardianSummary[] {
  const trimmed = query.trim()
  if (trimmed.length < SEARCH_MIN_LENGTH) return []
  const tokens = trimmed.toLowerCase().split(/\s+/)
  return guardians
    .filter((g) => {
      const haystack = `${g.first_name} ${g.last_name}`.toLowerCase()
      return tokens.every((t) => haystack.includes(t))
    })
    .slice(0, SEARCH_MAX_RESULTS)
}

function GuardianSelector({
  prefix,
  guardians,
  showAddress = false,
  requireEmail = false,
  defaultId,
  defaultRelationship,
}: {
  prefix: string
  guardians: GuardianSummary[]
  showAddress?: boolean
  requireEmail?: boolean
  defaultId?: string
  defaultRelationship?: string
}) {
  const [mode, setMode] = useState<'new' | 'existing'>(
    defaultId ? 'existing' : 'new',
  )
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(defaultId ?? '')

  function switchMode(next: 'new' | 'existing') {
    setMode(next)
    setSearch('')
  }

  const filtered = filterGuardians(guardians, search)

  return (
    <>
      <input type="hidden" name={`${prefix}_mode`} value={mode} />

      {guardians.length > 0 && (
        <div className="mb-4 flex gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name={`${prefix}_mode_radio`}
              checked={mode === 'new'}
              onChange={() => switchMode('new')}
              className="text-blue-600 focus:ring-blue-500"
            />
            Add new
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name={`${prefix}_mode_radio`}
              checked={mode === 'existing'}
              onChange={() => switchMode('existing')}
              className="text-blue-600 focus:ring-blue-500"
            />
            Select existing
          </label>
        </div>
      )}

      {mode === 'existing' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor={`${prefix}_search`}
              className="block text-sm font-medium text-gray-700"
            >
              Search guardians
            </label>
            <input
              id={`${prefix}_search`}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type at least 5 characters…"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">
              Type at least 5 characters · top 10 results shown
            </p>
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor={`${prefix}_existing_id`}
              className="block text-sm font-medium text-gray-700"
            >
              Guardian<span className="ml-0.5 text-red-500">*</span>
            </label>
            <select
              id={`${prefix}_existing_id`}
              name={`${prefix}_existing_id`}
              required
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">
                {search.trim().length === 0
                  ? 'Search above to find a guardian…'
                  : search.trim().length < SEARCH_MIN_LENGTH
                    ? 'Keep typing…'
                    : filtered.length === 0
                      ? 'No matches found'
                      : 'Select a guardian…'}
              </option>
              {/* Show currently selected guardian even when not in search results */}
              {selectedId &&
                !filtered.find((g) => g.id === selectedId) &&
                (() => {
                  const current = guardians.find((g) => g.id === selectedId)
                  return current ? (
                    <option key={current.id} value={current.id}>
                      {current.last_name}, {current.first_name} —{' '}
                      {current.phone}
                    </option>
                  ) : null
                })()}
              {filtered.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.last_name}, {g.first_name} — {g.phone}
                </option>
              ))}
            </select>
            {selectedId && (
              <Link
                href={`/portal/guardians/${selectedId}/edit`}
                className="mt-1 inline-block text-sm text-blue-600 hover:text-blue-800"
                target="_blank"
              >
                Edit guardian
              </Link>
            )}
          </div>
          <Field
            label="Relationship to student"
            name={`${prefix}_relationship`}
            required
            defaultValue={defaultRelationship}
          />
        </div>
      ) : (
        <GuardianFields
          prefix={prefix}
          showAddress={showAddress}
          requireEmail={requireEmail}
        />
      )}
    </>
  )
}

function FormSection({
  title,
  children,
  onRemove,
}: {
  title: string
  children: React.ReactNode
  onRemove?: () => void
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-gray-400 hover:text-red-500"
          >
            Remove
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function GuardianFields({
  prefix,
  showAddress = false,
  requireEmail = false,
}: {
  prefix: string
  showAddress?: boolean
  requireEmail?: boolean
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="First name" name={`${prefix}_first_name`} required />
        <Field label="Last name" name={`${prefix}_last_name`} required />
        <Field label="Phone" name={`${prefix}_phone`} type="tel" required />
        <Field
          label="Email"
          name={`${prefix}_email`}
          type="email"
          required={requireEmail}
        />
        <Field
          label="Relationship to student"
          name={`${prefix}_relationship`}
          required
        />
      </div>
      {showAddress && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Address line 1" name={`${prefix}_address_line_1`} />
          <Field label="Address line 2" name={`${prefix}_address_line_2`} />
          <Field label="City" name={`${prefix}_city`} />
          <Field label="Postcode" name={`${prefix}_postcode`} />
        </div>
      )}
    </>
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
