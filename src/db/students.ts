import { unstable_cache, revalidateTag } from 'next/cache'

import { supabase } from './client'

const STUDENT_LIST_SELECT = 'id, first_name, last_name, student_code'

const STUDENT_SELECT = `
  *,
  student_classes(class:classes(id, name, year_group, academic_year)),
  primary_guardian:guardians!students_primary_guardian_id_fkey(
    first_name, last_name, phone, email,
    address_line_1, address_line_2, city, postcode, notes
  ),
  secondary_guardian:guardians!students_secondary_guardian_id_fkey(
    first_name, last_name, phone, email,
    address_line_1, address_line_2, city, postcode, notes
  ),
  additional_contact_1:guardians!students_additional_contact_1_id_fkey(
    first_name, last_name, phone
  ),
  additional_contact_2:guardians!students_additional_contact_2_id_fkey(
    first_name, last_name, phone
  )
`

const STUDENT_SELECT_WITH_TEACHER = `
  *,
  student_classes(class:classes(id, name, year_group, teacher_id)),
  primary_guardian:guardians!students_primary_guardian_id_fkey(
    first_name, last_name, phone, email,
    address_line_1, address_line_2, city, postcode, notes
  ),
  secondary_guardian:guardians!students_secondary_guardian_id_fkey(
    first_name, last_name, phone, email,
    address_line_1, address_line_2, city, postcode, notes
  ),
  additional_contact_1:guardians!students_additional_contact_1_id_fkey(
    first_name, last_name, phone
  ),
  additional_contact_2:guardians!students_additional_contact_2_id_fkey(
    first_name, last_name, phone
  )
`

const OPTS = { revalidate: 60, tags: ['students'] }

export const getStudentsForList = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('students')
      .select(STUDENT_LIST_SELECT)
      .eq('active', true)
      .order('last_name')
    return data ?? []
  },
  ['students-for-list'],
  OPTS,
)

// Not cached — dynamic search input
export async function searchStudents(query: string) {
  const trimmed = query.trim()
  if (!trimmed) return []
  const { data } = await supabase
    .from('students')
    .select(STUDENT_LIST_SELECT)
    .eq('active', true)
    .or(`first_name.ilike.%${trimmed}%,last_name.ilike.%${trimmed}%`)
    .order('last_name')
    .limit(20)
  return data ?? []
}

export const getStudentsByTeacher = unstable_cache(
  async (teacherId: string) => {
    const { data: classes } = await supabase
      .from('classes')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('active', true)

    if (!classes?.length) return []

    const classIds = classes.map((c) => c.id)

    const { data: enrollments } = await supabase
      .from('student_classes')
      .select('student_id')
      .in('class_id', classIds)

    if (!enrollments?.length) return []

    const studentIds = [...new Set(enrollments.map((e) => e.student_id))]

    const { data } = await supabase
      .from('students')
      .select(STUDENT_SELECT)
      .in('id', studentIds)
      .eq('active', true)
      .order('last_name')
    return data ?? []
  },
  ['students-by-teacher'],
  { revalidate: 60, tags: ['students', 'classes'] },
)

export const getStudentIdsByTeacher = unstable_cache(
  async (teacherId: string): Promise<string[]> => {
    const { data: classes } = await supabase
      .from('classes')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('active', true)

    if (!classes?.length) return []

    const classIds = classes.map((c) => c.id)

    const { data: enrollments } = await supabase
      .from('student_classes')
      .select('student_id')
      .in('class_id', classIds)

    return [...new Set(enrollments?.map((e) => e.student_id) ?? [])]
  },
  ['student-ids-by-teacher'],
  { revalidate: 60, tags: ['students', 'classes'] },
)

export const getStudentCount = unstable_cache(
  async (): Promise<number> => {
    const { count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
    return count ?? 0
  },
  ['student-count'],
  OPTS,
)

export const getStudentsWithAllergiesCount = unstable_cache(
  async (): Promise<number> => {
    const { count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
      .not('allergies', 'is', null)
      .neq('allergies', '')
    return count ?? 0
  },
  ['students-allergies-count'],
  OPTS,
)

export const getAllStudents = unstable_cache(
  async () => {
    const { data } = await supabase
      .from('students')
      .select(STUDENT_SELECT)
      .eq('active', true)
      .order('last_name')
    return data ?? []
  },
  ['all-students'],
  OPTS,
)

export const getStudentsByClass = unstable_cache(
  async (classId: string) => {
    const { data: enrollments } = await supabase
      .from('student_classes')
      .select('student_id')
      .eq('class_id', classId)

    if (!enrollments?.length) return []

    const studentIds = enrollments.map((e) => e.student_id)

    const { data } = await supabase
      .from('students')
      .select(STUDENT_SELECT)
      .in('id', studentIds)
      .eq('active', true)
      .order('last_name')
    return data ?? []
  },
  ['students-by-class'],
  { revalidate: 60, tags: ['students', 'classes'] },
)

export const getStudentById = unstable_cache(
  async (id: string) => {
    const { data } = await supabase
      .from('students')
      .select(STUDENT_SELECT_WITH_TEACHER)
      .eq('id', id)
      .single()
    return data
  },
  ['student-by-id'],
  OPTS,
)

type StudentInsert = {
  first_name: string
  last_name: string
  student_code?: string | null
  date_of_birth?: string | null
  address_line_1: string
  address_line_2?: string | null
  city: string
  postcode: string
  primary_guardian_id: string
  primary_guardian_relationship?: string | null
  secondary_guardian_id?: string | null
  secondary_guardian_relationship?: string | null
  additional_contact_1_id?: string | null
  additional_contact_1_relationship?: string | null
  additional_contact_2_id?: string | null
  additional_contact_2_relationship?: string | null
  allergies?: string | null
  medical_details?: string | null
  notes?: string | null
}

export async function createStudent(data: StudentInsert) {
  const { data: student, error } = await supabase
    .from('students')
    .insert(data)
    .select('id')
    .single()
  if (error) throw error
  revalidateTag('students', 'max')
  return student
}

export async function enrollStudentInClasses(
  studentId: string,
  classIds: string[],
) {
  if (!classIds.length) return
  const { error } = await supabase
    .from('student_classes')
    .insert(
      classIds.map((classId) => ({ student_id: studentId, class_id: classId })),
    )
  if (error) throw error
  revalidateTag('students', 'max')
  revalidateTag('classes', 'max')
}

type StudentUpdate = Partial<StudentInsert>

export async function updateStudent(id: string, data: StudentUpdate) {
  const { error } = await supabase.from('students').update(data).eq('id', id)
  if (error) throw error
  revalidateTag('students', 'max')
}

export async function updateStudentClasses(
  studentId: string,
  classIds: string[],
) {
  const { error: deleteError } = await supabase
    .from('student_classes')
    .delete()
    .eq('student_id', studentId)
  if (deleteError) throw deleteError
  if (classIds.length > 0) {
    await enrollStudentInClasses(studentId, classIds)
  } else {
    revalidateTag('students', 'max')
    revalidateTag('classes', 'max')
  }
}
