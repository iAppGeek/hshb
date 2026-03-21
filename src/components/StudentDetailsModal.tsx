'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { XMarkIcon } from '@heroicons/react/24/outline'

import { canSeeStudentMedical, canEditGuardians } from '@/lib/permissions'
import type { StaffRole } from '@/types/next-auth'

const SECTION_H =
  'mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase'

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
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {hasStudentAddress && (
            <section>
              <h3 className={SECTION_H}>Student Address</h3>
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
            <h3 className={SECTION_H}>Primary Guardian</h3>
            {student.primary_guardian ? (
              <PersonCard
                firstName={student.primary_guardian.first_name}
                lastName={student.primary_guardian.last_name}
                phone={student.primary_guardian.phone}
                id={student.primary_guardian_id}
                relationship={student.primary_guardian_relationship}
                role={role}
                email={student.primary_guardian.email}
                addressLine1={student.primary_guardian.address_line_1}
                addressLine2={student.primary_guardian.address_line_2}
                city={student.primary_guardian.city}
                postcode={student.primary_guardian.postcode}
              />
            ) : (
              <p className="text-sm text-gray-400">No details recorded.</p>
            )}
          </section>

          {student.secondary_guardian && (
            <section className="border-t border-gray-100 pt-4">
              <h3 className={SECTION_H}>Secondary Guardian</h3>
              <PersonCard
                firstName={student.secondary_guardian.first_name}
                lastName={student.secondary_guardian.last_name}
                phone={student.secondary_guardian.phone}
                id={student.secondary_guardian_id}
                relationship={student.secondary_guardian_relationship}
                role={role}
                email={student.secondary_guardian.email}
                addressLine1={student.secondary_guardian.address_line_1}
                addressLine2={student.secondary_guardian.address_line_2}
                city={student.secondary_guardian.city}
                postcode={student.secondary_guardian.postcode}
              />
            </section>
          )}

          {student.additional_contact_1 && (
            <section className="border-t border-gray-100 pt-4">
              <h3 className={SECTION_H}>Additional Contact 1</h3>
              <PersonCard
                firstName={student.additional_contact_1.first_name}
                lastName={student.additional_contact_1.last_name}
                phone={student.additional_contact_1.phone}
                id={student.additional_contact_1_id}
                relationship={student.additional_contact_1_relationship}
                role={role}
              />
            </section>
          )}

          {student.additional_contact_2 && (
            <section className="border-t border-gray-100 pt-4">
              <h3 className={SECTION_H}>Additional Contact 2</h3>
              <PersonCard
                firstName={student.additional_contact_2.first_name}
                lastName={student.additional_contact_2.last_name}
                phone={student.additional_contact_2.phone}
                id={student.additional_contact_2_id}
                relationship={student.additional_contact_2_relationship}
                role={role}
              />
            </section>
          )}

          <section className="border-t border-gray-100 pt-4">
            <h3 className={SECTION_H}>Classes</h3>
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
            <h3 className={SECTION_H}>Allergies</h3>
            <p className="text-sm text-gray-600">
              {student.allergies ?? 'N/A'}
            </p>
          </section>

          {canSeeStudentMedical(role) && (
            <>
              <section className="border-t border-gray-100 pt-4">
                <h3 className={SECTION_H}>Medical Details</h3>
                <p className="text-sm text-gray-600">
                  {student.medical_details ?? '—'}
                </p>
              </section>
              <section className="border-t border-gray-100 pt-4">
                <h3 className={SECTION_H}>Notes</h3>
                <p className="text-sm text-gray-600">{student.notes ?? '—'}</p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

type PersonCardProps = {
  firstName: string
  lastName: string
  phone: string
  id: string | null
  relationship: string | null
  role: StaffRole
  email?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  city?: string | null
  postcode?: string | null
}

function PersonCard({
  firstName,
  lastName,
  phone,
  id,
  relationship,
  role,
  email,
  addressLine1,
  addressLine2,
  city,
  postcode,
}: PersonCardProps) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-gray-900">
          {firstName} {lastName}
          {relationship && (
            <span className="ml-1 font-normal text-gray-500">
              ({relationship})
            </span>
          )}
        </p>
        {canEditGuardians(role) && id && (
          <Link
            href={`/portal/guardians/${id}/edit`}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Edit
          </Link>
        )}
      </div>
      {email && <p className="text-sm text-gray-600">{email}</p>}
      <a
        href={`tel:${phone}`}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        {phone}
      </a>
      {(addressLine1 || city || postcode) && (
        <AddressBlock
          address_line_1={addressLine1 ?? null}
          address_line_2={addressLine2 ?? null}
          city={city ?? null}
          postcode={postcode ?? null}
        />
      )}
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
