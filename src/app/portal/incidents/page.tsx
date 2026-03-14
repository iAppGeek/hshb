import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getIncidents, getStudentIdsByTeacher } from '@/db'
import type { IncidentRow } from '@/db'
import type { StaffRole } from '@/types/next-auth'

import IncidentsClient from './IncidentsClient'

export const metadata: Metadata = { title: 'Incidents' }

export default async function IncidentsPage() {
  const session = await auth()
  if (!session) redirect('/portal/login')

  const role = session.user.role as StaffRole
  const staffId = session.user.staffId!
  const isTeacher = role === 'teacher'
  const canEdit = role === 'admin' || role === 'headteacher'

  let incidents: IncidentRow[]

  if (isTeacher) {
    const studentIds = await getStudentIdsByTeacher(staffId)
    incidents = await getIncidents({ studentIds, limit: 50 })
  } else {
    incidents = await getIncidents({ limit: 50 })
  }

  return (
    <IncidentsClient
      incidents={incidents}
      role={role}
      staffId={staffId}
      canEdit={canEdit}
    />
  )
}
