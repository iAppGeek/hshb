import { test, expect } from '../../fixtures/index'
import { db } from '../../fixtures/seed'

// Pin to admin — only admins can create students
test.use({ storageState: 'e2e/.auth/admin.json' })

const STUDENT_FIRST = 'E2ETest'
const STUDENT_LAST = 'GuardianAddress'
const GUARDIAN_FIRST = 'E2EGuardian'
const GUARDIAN_LAST = 'AddrTest'

test.describe('Add student', () => {
  test.afterEach(async () => {
    await db
      .from('students')
      .delete()
      .eq('first_name', STUDENT_FIRST)
      .eq('last_name', STUDENT_LAST)
    await db
      .from('guardians')
      .delete()
      .eq('first_name', GUARDIAN_FIRST)
      .eq('last_name', GUARDIAN_LAST)
  })

  test('creates student with address inherited from primary guardian', async ({
    page,
  }) => {
    await page.goto('/portal/students/new')

    // Student details
    await page.locator('input[name="student_first_name"]').fill(STUDENT_FIRST)
    await page.locator('input[name="student_last_name"]').fill(STUDENT_LAST)

    // Address mode defaults to "Same as guardian" (primary) — no interaction needed

    // Primary guardian (new)
    await page.locator('input[name="primary_first_name"]').fill(GUARDIAN_FIRST)
    await page.locator('input[name="primary_last_name"]').fill(GUARDIAN_LAST)
    await page.locator('input[name="primary_phone"]').fill('07700 900999')
    await page
      .locator('input[name="primary_email"]')
      .fill('e2e@test.hshb.local')
    await page.locator('input[name="primary_relationship"]').fill('Mother')
    await page
      .locator('input[name="primary_address_line_1"]')
      .fill('1 Test Street')
    await page.locator('input[name="primary_city"]').fill('London')
    await page.locator('input[name="primary_postcode"]').fill('EC1A 1BB')

    await page.getByRole('button', { name: 'Save student' }).click()

    await expect(page).toHaveURL('/portal/students')

    // Verify student was saved with address_guardian_id set and own address null
    const { data: student } = await db
      .from('students')
      .select('address_guardian_id, address_line_1')
      .eq('first_name', STUDENT_FIRST)
      .eq('last_name', STUDENT_LAST)
      .single()

    expect(student?.address_guardian_id).not.toBeNull()
    expect(student?.address_line_1).toBeNull()
  })
})
