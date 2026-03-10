import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getAllGuardians } from '@/db'
import type { StaffRole } from '@/types/next-auth'

import AddStudentForm from './AddStudentForm'

export const metadata: Metadata = { title: 'Add Student' }

export default async function AddStudentPage() {
  const session = await auth()
  const role = session?.user?.role as StaffRole

  if (role === 'admin') {
    // authorised — continue
  } else {
    redirect('/portal/students')
  }

  const guardians = await getAllGuardians()

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Student</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fields marked with <span className="text-red-500">*</span> are
          required.
        </p>
      </div>

      <AddStudentForm guardians={guardians} />
    </div>
  )
}
