import { describe, it, expect } from 'vitest'

import type { StaffRole } from '@/types/next-auth'

import {
  isTeacher,
  isAdmin,
  canSeeAllData,
  canCreateStudents,
  canEditStudents,
  canCreateStaff,
  canEditStaff,
  canCreateClasses,
  canEditClasses,
  canEditIncidents,
  canEditGuardians,
  canEditTimetables,
  canUpdateAttendance,
  canManageStaffAttendance,
  canAccessReports,
  canSeeStaffContact,
  canSeeStudentMedical,
  receivesNotifications,
  isTeachingStaff,
  showsOnSignInSheet,
  TEACHING_ROLES,
  NOTIFICATION_ROLES,
} from './permissions'

const ROLES: StaffRole[] = ['teacher', 'admin', 'headteacher', 'secretary']

/**
 * Truth-table helper: for each permission function, define which roles return true.
 */
const table: [string, (role: StaffRole) => boolean, StaffRole[]][] = [
  ['isTeacher', isTeacher, ['teacher']],
  ['isAdmin', isAdmin, ['admin']],
  ['canSeeAllData', canSeeAllData, ['admin', 'headteacher', 'secretary']],
  ['canCreateStudents', canCreateStudents, ['admin']],
  ['canEditStudents', canEditStudents, ['admin']],
  ['canCreateStaff', canCreateStaff, ['admin']],
  ['canEditStaff', canEditStaff, ['admin']],
  ['canCreateClasses', canCreateClasses, ['admin', 'headteacher']],
  ['canEditClasses', canEditClasses, ['admin', 'headteacher']],
  ['canEditIncidents', canEditIncidents, ['admin', 'headteacher']],
  ['canEditGuardians', canEditGuardians, ['admin']],
  ['canEditTimetables', canEditTimetables, ['admin', 'headteacher']],
  [
    'canUpdateAttendance',
    canUpdateAttendance,
    ['admin', 'headteacher', 'teacher'],
  ],
  [
    'canManageStaffAttendance',
    canManageStaffAttendance,
    ['admin', 'headteacher'],
  ],
  ['canAccessReports', canAccessReports, ['admin', 'headteacher', 'secretary']],
  [
    'canSeeStaffContact',
    canSeeStaffContact,
    ['admin', 'headteacher', 'secretary'],
  ],
  [
    'canSeeStudentMedical',
    canSeeStudentMedical,
    ['admin', 'headteacher', 'secretary'],
  ],
  ['receivesNotifications', receivesNotifications, ['admin', 'headteacher']],
  ['isTeachingStaff', isTeachingStaff, ['teacher', 'headteacher']],
  [
    'showsOnSignInSheet',
    showsOnSignInSheet,
    ['teacher', 'headteacher', 'secretary'],
  ],
]

describe('permissions', () => {
  describe.each(table)('%s', (_name, fn, allowedRoles) => {
    it.each(ROLES)('%s → %s', (role) => {
      expect(fn(role)).toBe(allowedRoles.includes(role))
    })
  })

  it('TEACHING_ROLES contains teacher and headteacher', () => {
    expect(TEACHING_ROLES).toEqual(['teacher', 'headteacher'])
  })

  it('NOTIFICATION_ROLES contains admin and headteacher', () => {
    expect(NOTIFICATION_ROLES).toEqual(['admin', 'headteacher'])
  })
})
