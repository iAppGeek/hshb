import { test, expect } from '../../fixtures/index'

type Role = 'admin' | 'headteacher' | 'teacher' | 'secretary'

type RouteRule = {
  route: string
  allowedRoles: Role[]
  redirectTo: string
}

// Guardian seed ID from supabase/seed.sql
const GUARDIAN_ID = '20000000-0000-0000-0000-000000000001'

const ROUTE_RULES: RouteRule[] = [
  {
    route: '/portal/students/new',
    allowedRoles: ['admin'],
    redirectTo: '/portal/students',
  },
  {
    route: '/portal/staff/new',
    allowedRoles: ['admin'],
    redirectTo: '/portal/staff',
  },
  {
    route: '/portal/classes/new',
    allowedRoles: ['admin', 'headteacher'],
    redirectTo: '/portal/classes',
  },
  {
    route: '/portal/lesson-plans/new',
    allowedRoles: ['admin', 'headteacher', 'teacher'],
    redirectTo: '/portal/lesson-plans',
  },
  {
    route: '/portal/reports',
    allowedRoles: ['admin', 'headteacher', 'secretary'],
    redirectTo: '/portal/dashboard',
  },
  {
    route: `/portal/guardians/${GUARDIAN_ID}/edit`,
    allowedRoles: ['admin'],
    redirectTo: '/portal/students',
  },
]

function getRoleFromProject(projectName: string): Role {
  const role = projectName.split(':')[1]
  return role as Role
}

for (const { route, allowedRoles, redirectTo } of ROUTE_RULES) {
  test.describe(`Route: ${route}`, () => {
    test('access is allowed or redirected based on role', async ({
      page,
      isMobile: _isMobile,
    }, testInfo) => {
      const role = getRoleFromProject(testInfo.project.name)
      const isAllowed = allowedRoles.includes(role)

      await page.goto(route)

      if (isAllowed) {
        // Should stay on (or navigate within) the target route, not be redirected away
        await expect(page).toHaveURL(
          new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
        )
      } else {
        // Should be redirected to the fallback route
        await expect(page).toHaveURL(
          new RegExp(redirectTo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
        )
      }
    })
  })
}
