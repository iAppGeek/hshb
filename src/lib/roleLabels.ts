import type { StaffRole } from '@/types/next-auth'

export const roleLabels: Record<StaffRole, string> = {
  teacher: 'Teacher',
  admin: 'Admin',
  headteacher: 'Headteacher',
  secretary: 'Secretary',
}

export const roleDescriptions: Record<StaffRole, string> = {
  teacher:
    'Can view and manage their own class data. Can record attendance and incidents for their students.',
  admin:
    'Full access. Can manage all students, staff, classes, guardians, incidents, and reports.',
  headteacher:
    'Can view all data and manage classes and incidents. Can access reports.',
  secretary:
    'Can view all data including reports. Read-only for most areas. Can record attendance and new incidents.',
}
