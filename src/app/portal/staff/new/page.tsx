import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import type { StaffRole } from '@/types/next-auth'

import AddStaffForm from './AddStaffForm'

export const metadata: Metadata = { title: 'Add Staff Member' }

export default async function AddStaffPage() {
  const session = await auth()
  const role = session?.user?.role as StaffRole

  if (role === 'admin') {
    // authorised — continue
  } else {
    redirect('/portal/staff')
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Staff Member</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fields marked with <span className="text-red-500">*</span> are
          required.
        </p>
      </div>

      <AddStaffForm />
    </div>
  )
}
