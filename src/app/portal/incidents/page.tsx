import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import {
  getIncidents,
  getClassesByTeacher,
  getStudentsByClass,
  getAllStudents,
} from '@/db'
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
  let students: Awaited<ReturnType<typeof getAllStudents>>

  if (isTeacher) {
    const classes = await getClassesByTeacher(staffId)
    const perClass = await Promise.all(
      classes.map((c) => getStudentsByClass(c.id)),
    )
    const studentMap = new Map(perClass.flat().map((s) => [s.id, s]))
    students = [...studentMap.values()]
    incidents = await getIncidents({ studentIds: students.map((s) => s.id) })
  } else {
    ;[incidents, students] = await Promise.all([
      getIncidents(),
      getAllStudents(),
    ])
  }

  return (
    <IncidentsClient
      incidents={incidents}
      students={students}
      role={role}
      staffId={staffId}
      canEdit={canEdit}
    />
  )
}
