export { supabase } from './client'
export {
  getStaffByEmail,
  getStaffById,
  getAllStaff,
  getAllStaffWithClasses,
  getTeachers,
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
export {
  getAllClasses,
  getAllClassesIncludingInactive,
  getClassById,
  getClassWithStudents,
  getClassesByTeacher,
  createClass,
  updateClass,
  setClassStudents,
} from './classes'
export { getAllTimetableSlots, getTimetableByClass } from './timetable'
export {
  getAttendanceByClassAndDate,
  getAttendanceLastUpdatedPerClass,
  saveAttendance,
} from './attendance'
export type { AttendanceStatus, AttendanceInsert } from './attendance'
