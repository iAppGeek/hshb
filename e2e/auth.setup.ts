import fs from 'fs'
import path from 'path'

import { test as setup } from '@playwright/test'

type Role = 'admin' | 'teacher' | 'headteacher' | 'secretary'

const TEST_USERS: Record<Role, string> = {
  admin: 'admin@test.hshb.local',
  teacher: 'teacher@test.hshb.local',
  headteacher: 'headteacher@test.hshb.local',
  secretary: 'secretary@test.hshb.local',
}

const AUTH_DIR = path.join(__dirname, '.auth')
fs.mkdirSync(AUTH_DIR, { recursive: true })

async function loginAs(
  role: Role,
  context: import('@playwright/test').BrowserContext,
  page: import('@playwright/test').Page,
): Promise<void> {
  await page.goto('/portal/login')
  await page.fill('[data-testid="test-email"]', TEST_USERS[role])
  await page.fill(
    '[data-testid="test-password"]',
    process.env.E2E_TEST_SECRET ?? '',
  )
  await page.click('[data-testid="test-login-button"]')
  await page.waitForURL('/portal/dashboard')
  await context.storageState({ path: path.join(AUTH_DIR, `${role}.json`) })
}

setup('authenticate as admin', async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  await loginAs('admin', context, page)
  await context.close()
})

setup('authenticate as teacher', async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  await loginAs('teacher', context, page)
  await context.close()
})

setup('authenticate as headteacher', async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  await loginAs('headteacher', context, page)
  await context.close()
})

setup('authenticate as secretary', async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  await loginAs('secretary', context, page)
  await context.close()
})
