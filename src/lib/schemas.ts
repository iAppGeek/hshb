import { z } from 'zod'

// ─── Reusable field schemas ──────────────────────────────────────────────────

export const uuid = z.string().uuid()

export const requiredString = z.string().trim().min(1, 'Required')

export const optionalString = z
  .string()
  .trim()
  .transform((v) => v || null)
  .nullable()

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date')

export const isoDateTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, 'Invalid datetime')

export const isoTime = z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time')

export const ukPhone = z
  .string()
  .trim()
  .min(7, 'Phone number is too short')
  .regex(/^[\d\s\-+()]+$/, 'Invalid phone number')

export const optionalUkPhone = z
  .string()
  .trim()
  .transform((v) => v || null)
  .nullable()
  .pipe(
    z
      .string()
      .regex(/^[\d\s\-+()]+$/, 'Invalid phone number')
      .nullable(),
  )

export const emailField = z.string().trim().email('Invalid email')

export const optionalEmail = z
  .string()
  .trim()
  .transform((v) => v || null)
  .nullable()
  .pipe(z.string().email('Invalid email').nullable())

export const staffRole = z.enum([
  'teacher',
  'admin',
  'headteacher',
  'secretary',
])

export const incidentType = z.enum(['medical', 'behaviour', 'other'])

export const attendanceStatus = z.enum(['present', 'absent', 'late'])

export const booleanFromString = z
  .enum(['true', 'false'])
  .transform((v) => v === 'true')

// ─── Domain schemas ──────────────────────────────────────────────────────────

export const saveAttendanceSchema = z.object({
  classId: uuid,
  date: isoDate,
  studentIds: z.array(uuid).min(1, 'At least one student is required'),
  records: z.array(
    z.object({
      studentId: uuid,
      status: attendanceStatus,
      notes: optionalString,
    }),
  ),
})

export const createClassSchema = z.object({
  name: requiredString,
  year_group: requiredString,
  room_number: optionalString,
  academic_year: optionalString,
  teacher_id: uuid,
  student_ids: z.array(uuid).default([]),
})

export const updateClassSchema = createClassSchema.extend({
  active: booleanFromString,
})

export const updateGuardianSchema = z.object({
  first_name: requiredString,
  last_name: requiredString,
  phone: ukPhone,
  email: optionalEmail,
  address_line_1: optionalString,
  address_line_2: optionalString,
  city: optionalString,
  postcode: optionalString,
  notes: optionalString,
})

export const createIncidentSchema = z.object({
  type: incidentType,
  student_id: uuid,
  title: requiredString,
  description: requiredString,
  incident_date: isoDateTime,
  parent_notified: booleanFromString,
  parent_notified_at: z
    .string()
    .trim()
    .transform((v) => v || null)
    .nullable(),
})

export const updateIncidentSchema = createIncidentSchema.omit({
  student_id: true,
})

export const createLessonPlanSchema = z.object({
  class_id: uuid,
  lesson_date: isoDate,
  description: requiredString.pipe(
    z.string().max(300, 'Description must be 300 characters or less'),
  ),
})

export const updateLessonPlanSchema = z.object({
  lesson_date: isoDate,
  description: requiredString.pipe(
    z.string().max(300, 'Description must be 300 characters or less'),
  ),
})

export const staffAttendanceSchema = z.object({
  staffId: uuid,
  date: isoDate,
  time: isoTime,
})

export const createStaffSchema = z.object({
  first_name: requiredString,
  last_name: requiredString,
  email: emailField,
  role: staffRole,
  display_name: optionalString,
  contact_number: optionalUkPhone,
})

export const updateStaffSchema = createStaffSchema

const guardianNewSchema = z.object({
  mode: z.literal('new'),
  first_name: requiredString,
  last_name: requiredString,
  phone: ukPhone,
  email: optionalEmail.optional(),
  address_line_1: optionalString.optional(),
  address_line_2: optionalString.optional(),
  city: optionalString.optional(),
  postcode: optionalString.optional(),
})

const guardianExistingSchema = z.object({
  mode: z.literal('existing'),
  existing_id: uuid,
})

export const guardianSchema = z.discriminatedUnion('mode', [
  guardianNewSchema,
  guardianExistingSchema,
])

const studentBaseSchema = z.object({
  student_first_name: requiredString,
  student_last_name: requiredString,
  student_code: optionalString,
  student_date_of_birth: optionalString,
  student_address_line_1: requiredString,
  student_address_line_2: optionalString,
  student_city: requiredString,
  student_postcode: requiredString,
  student_allergies: optionalString,
  student_medical_details: optionalString,
  student_notes: optionalString,
  primary_relationship: optionalString,
  has_secondary: booleanFromString,
  secondary_relationship: optionalString.optional(),
  has_contact1: booleanFromString,
  contact1_relationship: optionalString.optional(),
  has_contact2: booleanFromString,
  contact2_relationship: optionalString.optional(),
})

export const createStudentSchema = studentBaseSchema

export const updateStudentSchema = studentBaseSchema.extend({
  class_ids: z.array(uuid).default([]),
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

export type ActionResult = { error: string } | void

export function extractFormFields(
  formData: FormData,
  arrayFields: string[] = [],
): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (arrayFields.includes(key)) {
      const arr = obj[key]
      if (Array.isArray(arr)) {
        arr.push(value)
      } else {
        obj[key] = [value]
      }
    } else {
      obj[key] = value
    }
  }
  return obj
}

export function extractGuardianFields(
  formData: FormData,
  prefix: string,
): z.infer<typeof guardianSchema> {
  const mode = formData.get(`${prefix}_mode`) as string
  if (mode === 'existing') {
    return {
      mode: 'existing',
      existing_id: formData.get(`${prefix}_existing_id`) as string,
    }
  }
  return {
    mode: 'new',
    first_name: (formData.get(`${prefix}_first_name`) as string) ?? '',
    last_name: (formData.get(`${prefix}_last_name`) as string) ?? '',
    phone: (formData.get(`${prefix}_phone`) as string) ?? '',
    email: (formData.get(`${prefix}_email`) as string) ?? undefined,
    address_line_1:
      (formData.get(`${prefix}_address_line_1`) as string) ?? undefined,
    address_line_2:
      (formData.get(`${prefix}_address_line_2`) as string) ?? undefined,
    city: (formData.get(`${prefix}_city`) as string) ?? undefined,
    postcode: (formData.get(`${prefix}_postcode`) as string) ?? undefined,
  }
}
