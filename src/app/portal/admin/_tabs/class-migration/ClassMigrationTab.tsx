import { getAllClasses, getTeachers, getStudentsByClass } from '@/db'

import ClassMigrationForm from './ClassMigrationForm'
import type { MigrationStudent } from './ClassMigrationForm'
import { migrateClassAction } from './actions'

type Props = {
  sourceClassId: string | undefined
}

export default async function ClassMigrationTab({
  sourceClassId,
}: Props): Promise<React.ReactElement> {
  const [classes, teachers] = await Promise.all([
    getAllClasses(),
    getTeachers(),
  ])

  const students: MigrationStudent[] = sourceClassId
    ? await getStudentsByClass(sourceClassId)
    : []

  return (
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
      baseUrl="/portal/admin?tab=class-migration"
    />
  )
}
