'use client'

import { useEffect } from 'react'
import Link from 'next/link'

import type { StaffRole } from '@/types/next-auth'

type GuardianInfo = {
  first_name: string
  last_name: string
  phone: string
  email: string | null
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  postcode: string | null
  notes: string | null
}

type AdditionalContact = {
  first_name: string
  last_name: string
  phone: string
}

export type StudentForModal = {
  id: string
  first_name: string
  last_name: string
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  postcode: string | null
  allergies: string | null
  notes: string | null
  primary_guardian_id: string | null
  primary_guardian: GuardianInfo | null
  primary_guardian_relationship: string | null
  secondary_guardian_id: string | null
  secondary_guardian: GuardianInfo | null
  secondary_guardian_relationship: string | null
  additional_contact_1_id: string | null
  additional_contact_1: AdditionalContact | null
  additional_contact_1_relationship: string | null
  additional_contact_2_id: string | null
  additional_contact_2: AdditionalContact | null
  additional_contact_2_relationship: string | null
  medical_details: string | null
  student_classes: Array<{
    class: {
      id: string
      name: string
      year_group: string
      academic_year: string | null
    } | null
  }>
}

type Props = {
  student: StudentForModal
  role: StaffRole
  onClose: () => void
}

export default function StudentDetailsModal({ student, role, onClose }: Props) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const hasStudentAddress =
    student.address_line_1 || student.city || student.postcode

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl ring-1 ring-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {student.last_name}, {student.first_name}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {hasStudentAddress && (
            <section>
              <h3 className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                Student Address
              </h3>
              <AddressBlock
                address_line_1={student.address_line_1}
                address_line_2={student.address_line_2}
                city={student.city}
                postcode={student.postcode}
              />
            </section>
          )}

          <section
            className={
              hasStudentAddress ? 'border-t border-gray-100 pt-4' : undefined
            }
          >
            <h3 className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
              Primary Guardian
            </h3>
            {student.primary_guardian ? (
              <GuardianCard
                guardian={student.primary_guardian}
                guardianId={student.primary_guardian_id}
                relationship={student.primary_guardian_relationship}
                role={role}
              />
            ) : (
              <p className="text-sm text-gray-400">No details recorded.</p>
            )}
          </section>

          {student.secondary_guardian && (
            <section className="border-t border-gray-100 pt-4">
              <h3 className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                Secondary Guardian
              </h3>
              <GuardianCard
                guardian={student.secondary_guardian}
                guardianId={student.secondary_guardian_id}
                relationship={student.secondary_guardian_relationship}
                role={role}
              />
            </section>
          )}

          {student.additional_contact_1 && (
            <section className="border-t border-gray-100 pt-4">
              <h3 className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                Additional Contact 1
              </h3>
              <ContactCard
                contact={student.additional_contact_1}
                contactId={student.additional_contact_1_id}
                relationship={student.additional_contact_1_relationship}
                role={role}
              />
            </section>
          )}

          {student.additional_contact_2 && (
            <section className="border-t border-gray-100 pt-4">
              <h3 className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                Additional Contact 2
              </h3>
              <ContactCard
                contact={student.additional_contact_2}
                contactId={student.additional_contact_2_id}
                relationship={student.additional_contact_2_relationship}
                role={role}
              />
            </section>
          )}

          <section className="border-t border-gray-100 pt-4">
            <h3 className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
              Classes
            </h3>
            <p className="text-sm text-gray-600">
              {student.student_classes.length > 0
                ? student.student_classes
                    .map((sc) => {
                      if (!sc.class) return null
                      return sc.class.academic_year
                        ? `${sc.class.name} (${sc.class.academic_year})`
                        : sc.class.name
                    })
                    .filter(Boolean)
                    .join(', ')
                : 'None'}
            </p>
          </section>

          <section className="border-t border-gray-100 pt-4">
            <h3 className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
              Allergies
            </h3>
            <p className="text-sm text-gray-600">
              {student.allergies ?? 'N/A'}
            </p>
          </section>

          {(role === 'admin' || role === 'headteacher') && (
            <>
              <section className="border-t border-gray-100 pt-4">
                <h3 className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Medical Details
                </h3>
                <p className="text-sm text-gray-600">
                  {student.medical_details ?? '—'}
                </p>
              </section>
              <section className="border-t border-gray-100 pt-4">
                <h3 className="mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Notes
                </h3>
                <p className="text-sm text-gray-600">{student.notes ?? '—'}</p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function GuardianCard({
  guardian,
  guardianId,
  relationship,
  role,
}: {
  guardian: GuardianInfo
  guardianId: string | null
  relationship: string | null
  role: StaffRole
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-gray-900">
          {guardian.first_name} {guardian.last_name}
          {relationship && (
            <span className="ml-1 font-normal text-gray-500">
              ({relationship})
            </span>
          )}
        </p>
        {role === 'admin' && guardianId && (
          <Link
            href={`/portal/guardians/${guardianId}/edit`}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Edit
          </Link>
        )}
      </div>
      {guardian.email && (
        <p className="text-sm text-gray-600">{guardian.email}</p>
      )}
      <p className="text-sm text-gray-600">{guardian.phone}</p>
      {(guardian.address_line_1 || guardian.city || guardian.postcode) && (
        <AddressBlock
          address_line_1={guardian.address_line_1}
          address_line_2={guardian.address_line_2}
          city={guardian.city}
          postcode={guardian.postcode}
        />
      )}
    </div>
  )
}

function ContactCard({
  contact,
  contactId,
  relationship,
  role,
}: {
  contact: AdditionalContact
  contactId: string | null
  relationship: string | null
  role: StaffRole
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-gray-900">
          {contact.first_name} {contact.last_name}
          {relationship && (
            <span className="ml-1 font-normal text-gray-500">
              ({relationship})
            </span>
          )}
        </p>
        {role === 'admin' && contactId && (
          <Link
            href={`/portal/guardians/${contactId}/edit`}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Edit
          </Link>
        )}
      </div>
      <p className="text-sm text-gray-600">{contact.phone}</p>
    </div>
  )
}

function AddressBlock({
  address_line_1,
  address_line_2,
  city,
  postcode,
}: {
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  postcode: string | null
}) {
  return (
    <div className="text-sm text-gray-600">
      {address_line_1 && <p>{address_line_1}</p>}
      {address_line_2 && <p>{address_line_2}</p>}
      {(city || postcode) && (
        <p>{[city, postcode].filter(Boolean).join(', ')}</p>
      )}
    </div>
  )
}
