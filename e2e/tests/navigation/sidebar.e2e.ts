import { test, expect } from '../../fixtures/index'

type Role = 'admin' | 'headteacher' | 'teacher' | 'secretary'

// Roles that can access the Reports nav item
const REPORTS_ROLES: Role[] = ['admin', 'headteacher', 'secretary']
// Roles that receive push notifications (notification slot rendered)
const NOTIFICATION_ROLES: Role[] = ['admin', 'headteacher']

function getRoleFromProject(projectName: string): Role {
  return projectName.split(':')[1] as Role
}

test.describe('Sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portal/dashboard')
  })

  test('common nav items are visible for all roles', async ({
    page,
    isMobile,
  }, testInfo) => {
    const role = getRoleFromProject(testInfo.project.name)

    if (isMobile) {
      // Open drawer first
      await page.getByRole('button', { name: 'Open navigation' }).click()
      await expect(
        page.locator('aside').filter({ hasText: 'Dashboard' }).first(),
      ).toBeVisible()
    }

    const sidebar = isMobile
      ? page
          .locator('aside')
          .filter({ hasText: 'Dashboard' })
          .and(page.locator('.translate-x-0, [class*="translate-x-0"]'))
      : page.locator('aside.sticky')

    // All roles see these core nav items
    const commonItems = [
      'Dashboard',
      'Staff',
      'Students',
      'Classes',
      'Attendance',
      'Lesson Plans',
      'Staff Sign-In',
      'Incidents',
    ]

    for (const label of commonItems) {
      await expect(
        page.getByRole('button', { name: label }).first(),
      ).toBeVisible()
    }

    void role // used indirectly — sidebar content varies by role below
  })

  test('Reports nav item is visible for admin, headteacher, secretary — hidden for teacher', async ({
    page,
    isMobile,
  }, testInfo) => {
    const role = getRoleFromProject(testInfo.project.name)

    if (isMobile) {
      await page.getByRole('button', { name: 'Open navigation' }).click()
    }

    const reportsButton = page.getByRole('button', { name: 'Reports' }).first()

    if (REPORTS_ROLES.includes(role)) {
      await expect(reportsButton).toBeVisible()
    } else {
      await expect(reportsButton).not.toBeVisible()
    }
  })

  test('notification slot is rendered for admin and headteacher only', async ({
    page,
    isMobile,
  }, testInfo) => {
    const role = getRoleFromProject(testInfo.project.name)

    if (isMobile) {
      await page.getByRole('button', { name: 'Open navigation' }).click()
    }

    // The notification slot wrapper div — only present for admin and headteacher
    const notificationContainer = page
      .locator('.bg-gray-800.px-3.py-2')
      .filter({ hasText: '' })
      .first()

    if (NOTIFICATION_ROLES.includes(role)) {
      await expect(notificationContainer).toBeAttached()
    } else {
      await expect(notificationContainer).not.toBeAttached()
    }
  })

  test('sign out button is visible', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.getByRole('button', { name: 'Open navigation' }).click()
    }

    await expect(
      page.getByRole('button', { name: 'Sign out' }).first(),
    ).toBeVisible()
  })

  test('sign out redirects to login page', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.getByRole('button', { name: 'Open navigation' }).click()
    }

    await page.getByRole('button', { name: 'Sign out' }).first().click()
    await expect(page).toHaveURL(/\/portal\/login/)
  })

  test.describe('Mobile drawer behaviour', () => {
    test('desktop: nav items are visible without opening a drawer', async ({
      page,
      isMobile,
    }) => {
      if (isMobile) test.skip()

      // Nav buttons should be immediately visible — no hamburger interaction needed
      await expect(
        page.getByRole('button', { name: 'Dashboard' }).first(),
      ).toBeVisible()
      // Hamburger button must not be visible on desktop
      await expect(
        page.getByRole('button', { name: 'Open navigation' }),
      ).not.toBeVisible()
    })

    test('mobile: hamburger button opens drawer', async ({
      page,
      isMobile,
    }) => {
      if (!isMobile) test.skip()

      const hamburger = page.getByRole('button', { name: 'Open navigation' })
      await expect(hamburger).toBeVisible()

      // Drawer is off-screen before opening
      const mobileDrawer = page.locator('aside.-translate-x-full')
      await expect(mobileDrawer).toBeAttached()

      await hamburger.click()

      // Drawer slides in
      const openDrawer = page.locator('aside.translate-x-0')
      await expect(openDrawer).toBeVisible()
    })

    test('mobile: close button hides the drawer', async ({
      page,
      isMobile,
    }) => {
      if (!isMobile) test.skip()

      await page.getByRole('button', { name: 'Open navigation' }).click()
      await expect(page.locator('aside.translate-x-0')).toBeVisible()

      await page.getByRole('button', { name: 'Close navigation' }).click()

      await expect(page.locator('aside.-translate-x-full')).toBeAttached()
    })

    test('mobile: clicking a nav item closes the drawer', async ({
      page,
      isMobile,
    }) => {
      if (!isMobile) test.skip()

      await page.getByRole('button', { name: 'Open navigation' }).click()
      await expect(page.locator('aside.translate-x-0')).toBeVisible()

      // Click a nav item — drawer should close
      await page.getByRole('button', { name: 'Students' }).first().click()

      await expect(page.locator('aside.-translate-x-full')).toBeAttached()
    })
  })
})
