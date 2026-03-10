export { supabase } from './client'
export {
  getStaffByEmail,
  getStaffById,
  getAllStaff,
  getAllStaffWithClasses,
  createStaff,
  updateStaff,
} from './staff'
export {
  getAllStudents,
  getStudentsByClass,
  getStudentById,
  createStudent,
  enrollStudentInClasses,
  updateStudent,
  updateStudentClasses,
} from './students'
export {
  getAllGuardians,
  createGuardian,
  getGuardianById,
  getStudentsByGuardian,
  updateGuardian,
} from './guardians'
export type {
  GuardianSummary,
  GuardianFull,
  GuardianStudentLink,
} from './guardians'
export { getAllClasses, getClassesByTeacher } from './classes'
export { getAllTimetableSlots, getTimetableByClass } from './timetable'
export { getAttendanceByClassAndDate, saveAttendance } from './attendance'
export type { AttendanceStatus, AttendanceInsert } from './attendance'
