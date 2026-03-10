import { supabase } from './client'

const STUDENT_SELECT = `
  *,
  student_classes(class:classes(id, name, year_group)),
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

export async function getAllStudents() {
  const { data } = await supabase
    .from('students')
    .select(STUDENT_SELECT)
    .eq('active', true)
    .order('last_name')
  return data ?? []
}

export async function getStudentsByClass(classId: string) {
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
}

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
}

export async function getStudentById(id: string) {
  const { data } = await supabase
    .from('students')
    .select(STUDENT_SELECT_WITH_TEACHER)
    .eq('id', id)
    .single()
  return data
}

type StudentUpdate = Partial<StudentInsert>

export async function updateStudent(id: string, data: StudentUpdate) {
  const { error } = await supabase.from('students').update(data).eq('id', id)
  if (error) throw error
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
  }
}
