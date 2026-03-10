export { supabase } from './client'
export { getStaffByEmail, getAllStaff, getAllStaffWithClasses } from './staff'
export {
  getAllStudents,
  getStudentsByClass,
  getStudentById,
  createStudent,
  enrollStudentInClasses,
} from './students'
export { getAllGuardians, createGuardian } from './guardians'
export type { GuardianSummary } from './guardians'
export { getAllClasses, getClassesByTeacher } from './classes'
export { getAllTimetableSlots, getTimetableByClass } from './timetable'
export { getAttendanceByClassAndDate, saveAttendance } from './attendance'
export type { AttendanceStatus, AttendanceInsert } from './attendance'
