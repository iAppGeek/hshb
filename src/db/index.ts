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
  getGuardianCount,
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
  getIncidentCount,
  getIncidents,
  getIncidentCountsByDateRange,
  createIncident,
  updateIncident,
  getIncidentById,
} from './incidents'
export type { IncidentType, IncidentRow, IncidentCounts } from './incidents'
export {
  getLessonPlanCount,
  getLessonPlanCountByDate,
  getLessonPlans,
  getLessonPlanById,
  createLessonPlan,
  updateLessonPlan,
} from './lesson-plans'
export type { LessonPlanRow } from './lesson-plans'
export {
  savePushSubscription,
  deletePushSubscription,
  pushSubscriptionExists,
  getAdminSubscriptions,
} from './push-subscriptions'
export type {
  SavePushSubscriptionInput,
  PushSubscriptionRow,
} from './push-subscriptions'
export {
  getAttendanceByClassAndDate,
  getAttendanceSummaryByDate,
  getAttendanceLateCount,
  getAttendanceByDateRange,
  getAttendanceLateCountByDateRange,
  saveAttendance,
} from './attendance'
export type { AttendanceStatus, AttendanceInsert } from './attendance'
export {
  getStaffAttendanceForToday,
  getStaffAttendanceByDate,
  getStaffAttendanceByDateRange,
  signInStaff,
  signOutStaff,
  getStaffSignedInCount,
} from './staff-attendance'
export type { StaffAttendanceRow } from './staff-attendance'
export { logAuditEvent } from './audit-log'
