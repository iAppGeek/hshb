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
  getStudentsForList,
  searchStudents,
  getStudentsByTeacher,
  getStudentIdsByTeacher,
  getStudentCount,
  getStudentsWithAllergiesCount,
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
  getEnrollmentCountsByClass,
  createClass,
  updateClass,
  setClassStudents,
} from './classes'
export { getAllTimetableSlots, getTimetableByClass } from './timetable'
export {
  getIncidents,
  createIncident,
  updateIncident,
  getIncidentById,
} from './incidents'
export type { IncidentType, IncidentRow } from './incidents'
export {
  getAttendanceByClassAndDate,
  getAttendanceSummaryByDate,
  getAttendanceLastUpdatedPerClass,
  saveAttendance,
} from './attendance'
export type { AttendanceStatus, AttendanceInsert } from './attendance'
