'use client'

import { useEffect } from 'react'

import type { Json } from '@/types/database'

type EmergencyContact = {
  name: string
  relationship: string
  phone: string
}

export type StudentForModal = {
  id: string
  first_name: string
  last_name: string
  primary_parent_name: string | null
  primary_parent_email: string | null
  primary_parent_phone: string | null
  secondary_parent_name: string | null
  secondary_parent_email: string | null
  secondary_parent_phone: string | null
  emergency_contacts: Json
}

type Props = {
  student: StudentForModal
  onClose: () => void
}

export default function StudentDetailsModal({ student, onClose }: Props) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const emergencyContacts = (student.emergency_contacts as EmergencyContact[] | null) ?? []

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-xl bg-white shadow-xl ring-1 ring-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {student.last_name}, {student.first_name}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4">
          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
              Primary Parent / Guardian
            </h3>
            {student.primary_parent_name ? (
              <ContactCard
                name={student.primary_parent_name}
                email={student.primary_parent_email}
                phone={student.primary_parent_phone}
              />
            ) : (
              <p className="text-sm text-gray-400">No details recorded.</p>
            )}
          </section>

          {student.secondary_parent_name && (
            <section className="mt-4 border-t border-gray-100 pt-4">
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Secondary Parent / Guardian
              </h3>
              <ContactCard
                name={student.secondary_parent_name}
                email={student.secondary_parent_email}
                phone={student.secondary_parent_phone}
              />
            </section>
          )}

          {emergencyContacts.length > 0 && (
            <section className="mt-4 border-t border-gray-100 pt-4">
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Emergency Contacts
              </h3>
              <div className="space-y-3">
                {emergencyContacts.map((ec, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium text-gray-900">
                      {ec.name}{' '}
                      <span className="font-normal text-gray-500">({ec.relationship})</span>
                    </p>
                    <p className="text-sm text-gray-600">{ec.phone}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function ContactCard({
  name,
  email,
  phone,
}: {
  name: string
  email: string | null
  phone: string | null
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-sm font-medium text-gray-900">{name}</p>
      {email && <p className="text-sm text-gray-600">{email}</p>}
      {phone && <p className="text-sm text-gray-600">{phone}</p>}
    </div>
  )
}
