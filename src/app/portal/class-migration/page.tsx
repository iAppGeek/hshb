import { type ReactNode } from 'react'
import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getAllClasses, getTeachers, getStudentsByClass } from '@/db'
import { canMigrateClasses } from '@/lib/permissions'
import type { StaffRole } from '@/types/next-auth'

import ClassMigrationForm from './ClassMigrationForm'
import type { MigrationStudent } from './ClassMigrationForm'
import { migrateClassAction } from './actions'

export const metadata: Metadata = { title: 'Class Migration' }

export default async function ClassMigrationPage({
  searchParams,
}: {
  searchParams: Promise<{ sourceClassId?: string }>
}): Promise<ReactNode> {
  const session = await auth()
  const role = session?.user?.role as StaffRole | undefined

  if (!role || !canMigrateClasses(role)) {
    redirect('/portal/classes')
  }

  const { sourceClassId } = await searchParams

  const [classes, teachers] = await Promise.all([
    getAllClasses(),
    getTeachers(),
  ])

  const students: MigrationStudent[] = sourceClassId
    ? await getStudentsByClass(sourceClassId)
    : []

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Class Migration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select a class to migrate, then fill in the details for the new class.
          All students will be moved automatically.
        </p>
      </div>

      <ClassMigrationForm
        classes={classes.map((c) => ({
          id: c.id,
          name: c.name,
          year_group: c.year_group,
          academic_year: c.academic_year,
        }))}
        teachers={teachers.map((t) => ({
          id: t.id,
          first_name: t.first_name,
          last_name: t.last_name,
          display_name: t.display_name,
        }))}
        sourceClassId={sourceClassId ?? null}
        students={students}
        action={migrateClassAction}
      />
    </div>
  )
}
