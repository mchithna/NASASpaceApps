import { expect, test, type Page } from '@playwright/test'

const apiAttempts = new WeakMap<Page, number>()

test.beforeEach(async ({ page }) => {
  // A local fixture run must never contact a real auth/database endpoint.
  apiAttempts.set(page, 0)
  await page.route(/\/(auth|rest)\/v1\//, (route) => {
    apiAttempts.set(page, (apiAttempts.get(page) ?? 0) + 1)
    return route.abort()
  })
})
test.afterEach(async ({ page }) => {
  expect(apiAttempts.get(page)).toBe(0)
})

async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true)
  const checks = await page.evaluate(() => {
    const style = getComputedStyle(document.body)
    const luminance = (color: string) =>
      (color.match(/[\d.]+/g) ?? [])
        .slice(0, 3)
        .map(Number)
        .map((value) => value / 255)
        .map((value) =>
          value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
        )
        .reduce(
          (total, value, index) =>
            total + value * [0.2126, 0.7152, 0.0722][index],
          0,
        )
    const foreground = luminance(style.color),
      background = luminance(style.backgroundColor)
    const smallControls = [...document.querySelectorAll('button')].filter(
      (button) => {
        const box = button.getBoundingClientRect()
        return (
          button.getClientRects().length > 0 &&
          !button.disabled &&
          (box.height < 24 || box.width < 24)
        )
      },
    ).length
    return {
      contrast:
        (Math.max(foreground, background) + 0.05) /
        (Math.min(foreground, background) + 0.05),
      smallControls,
    }
  })
  expect(checks.contrast).toBeGreaterThanOrEqual(4.5)
  expect(checks.smallControls).toBe(0)
}
async function onboard(page: Page) {
  await page.goto('/?acceptance=training')
  await expect(
    page.getByRole('heading', { level: 1, name: 'NovaExplorer' }),
  ).toBeVisible()
  await expect(
    page.getByText(/Isolated acceptance fixture. Synthetic training rewards/),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Begin Exploring' }).click()
  await page.getByLabel('Choose Callsign').fill('Acceptance Cadet')
  await page.getByRole('radio', { name: /Deep Space Pioneer/ }).check()
  await page
    .getByRole('button', { name: 'Save Profile & Enter Mission Control' })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Mission Control', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('Acceptance Cadet', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText('0 XP', { exact: true }).first()).toBeVisible()
  await noOverflow(page)
  expect(
    await page.evaluate(
      () => matchMedia('(prefers-reduced-motion: reduce)').matches,
    ),
  ).toBe(true)
}
async function heading(page: Page, name: string) {
  await expect(
    page.getByRole('heading', { level: 2, name, exact: true }),
  ).toBeVisible()
}

test('fresh guest completes isolated mission, refreshes, shares outcomes, replays and signs out', async ({
  page,
}, info) => {
  await onboard(page)
  await expect(page.getByRole('link', { name: /Begin Story for/ })).toHaveCount(
    5,
  )
  await page
    .getByRole('link', { name: 'Open isolated training simulator' })
    .click()
  await page.getByRole('button', { name: 'Start', exact: true }).focus()
  await page.keyboard.press('Enter')
  await heading(page, 'Training simulator intro')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await heading(page, 'Training simulator evidence')
  await expect(
    page.getByRole('link', { name: 'Surveyor 3 — NASA Science' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await heading(page, 'Training simulator timeline')
  await page
    .getByRole('button', { name: 'Move Read the practice card up' })
    .focus()
  await page.keyboard.press('Enter')
  await page.getByRole('button', { name: 'Check order' }).focus()
  await page.keyboard.press('Enter')
  await heading(page, 'Training simulator custom slot')
  await page
    .getByRole('button', { name: 'Mark the practice slot done' })
    .click()
  await heading(page, 'Training simulator discovery')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await heading(page, 'Training simulator ending')
  await noOverflow(page)
  await page.getByRole('button', { name: 'Exit mission', exact: true }).click()
  await expect(page.getByText('85 XP', { exact: true }).first()).toBeVisible()
  await page.reload()
  await expect(
    page.getByText('Acceptance Cadet', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText('85 XP', { exact: true }).first()).toBeVisible()
  await page
    .getByRole('link', { name: 'Open isolated training simulator' })
    .click()
  await heading(page, 'Training simulator ending')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(
    page.getByText('Your place is saved.', { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Exit mission', exact: true }).click()
  await expect(page.getByText('100 XP', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('1 / 5', { exact: true })).toBeVisible()
  await page.screenshot({
    path: info.outputPath('completed-dashboard.png'),
    fullPage: true,
  })
  await page
    .getByRole('navigation', { name: 'Explorer', exact: true })
    .getByRole('link', { name: 'Profile', exact: true })
    .click()
  await expect(
    page.getByText('Acceptance Cadet', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText('Level 2', { exact: true })).toBeVisible()
  await expect(page.getByText('100 XP', { exact: true }).first()).toBeVisible()
  await noOverflow(page)
  await page
    .getByRole('navigation', { name: 'Explorer', exact: true })
    .getByRole('link', { name: 'Journal', exact: true })
    .click()
  await expect(
    page.getByText('Placeholder discovery', { exact: true }),
  ).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Explorer', exact: true })
    .getByRole('link', { name: 'Achievements', exact: true })
    .click()
  await expect(page.getByText('Unlocked', { exact: true })).toHaveCount(1)
  await page
    .getByRole('link', { name: 'Open isolated training simulator' })
    .click()
  await page.getByRole('button', { name: 'Start again' }).click()
  await heading(page, 'Training simulator intro')
  for (let index = 0; index < 5; index++)
    await page.getByRole('button', { name: 'Next', exact: true }).click()
  await heading(page, 'Training simulator ending')
  await page.getByRole('button', { name: 'Exit mission', exact: true }).click()
  await expect(page.getByText('100 XP', { exact: true }).first()).toBeVisible()
  await page
    .getByRole('button', { name: 'End guest session', exact: true })
    .click()
  await page.goto('/profile')
  await expect(page.getByText('Signed Out', { exact: true })).toBeVisible()
  await expect(page.getByText('Acceptance Cadet', { exact: true })).toHaveCount(
    0,
  )
  await page.getByRole('button', { name: 'New isolated test guest' }).click()
  await page.getByRole('link', { name: 'Begin Exploring' }).click()
  await page
    .getByRole('button', { name: 'Save Profile & Enter Mission Control' })
    .click()
  await expect(page.getByText('0 XP', { exact: true }).first()).toBeVisible()
})

test('all five public placeholders and invalid routes remain safe', async ({
  page,
}) => {
  await onboard(page)
  for (const [id, name] of [
    ['surveyor-3', 'Surveyor 3'],
    ['opportunity', 'Opportunity'],
    ['ingenuity', 'Ingenuity'],
    ['insight', 'InSight'],
    ['pioneer-10', 'Pioneer 10'],
  ]) {
    await page.goto(`/missions/${id}`)
    await expect(
      page.getByRole('heading', { level: 1, name, exact: true }),
    ).toBeVisible()
    await page.getByRole('link', { name: 'Start mission', exact: true }).click()
    await expect(page.getByText(/This chapter is being prepared/)).toBeVisible()
    await noOverflow(page)
  }
  for (const path of [
    '/missions/unknown/play',
    '/missions/training-simulator/play',
    '/missing-page',
  ]) {
    await page.goto(path)
    await expect(
      page.getByRole('heading', { name: 'Page not found' }),
    ).toBeVisible()
  }
})

test('interrupted fixture save shows failure and can retry without false success', async ({
  page,
}) => {
  await onboard(page)
  await page
    .getByRole('link', { name: 'Open isolated training simulator' })
    .click()
  await expect(
    page.getByRole('button', { name: 'Start', exact: true }),
  ).toBeVisible()
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    let fail = true
    Storage.prototype.setItem = function (key, value) {
      if (key === 'novaexplorer.acceptance.training.v1' && fail) {
        fail = false
        throw new DOMException(
          'Synthetic interrupted fixture write',
          'QuotaExceededError',
        )
      }
      return original.call(this, key, value)
    }
  })
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText(
    'The mission could not be saved',
  )
  await expect(
    page.getByText('Your place is saved.', { exact: true }),
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  await heading(page, 'Training simulator intro')
  await page.reload()
  await heading(page, 'Training simulator intro')
})

test('shared loading/empty/error states and keyboard dialog remain accessible', async ({
  page,
}) => {
  await page.goto('/dev/components')
  await expect(
    page.getByText('Loading the story', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText('No notes yet', { exact: true })).toBeVisible()
  await expect(page.getByRole('alert')).toContainText('Nothing was changed')
  expect(
    await page.evaluate(
      () => matchMedia('(prefers-reduced-motion: reduce)').matches,
    ),
  ).toBe(true)
  const open = page
    .getByRole('button', { name: 'Open dialog', exact: true })
    .last()
  await open.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Mission note' })
  await expect(dialog).toBeVisible()
  await expect(
    dialog.getByRole('heading', { name: 'Mission note' }),
  ).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(
    dialog.getByRole('button', { name: 'Close', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(
    dialog.getByRole('button', { name: 'Done', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(
    dialog.getByRole('button', { name: 'Close', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(open).toBeFocused()
  await noOverflow(page)
})

test('a slow initial training module has a visible loading state', async ({
  page,
}) => {
  await onboard(page)
  await page.route(
    /\/src\/engine\/training\/TrainingSimulatorPreview\.tsx(?:\?.*)?$/,
    async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await route.continue()
    },
  )
  await page.goto('/dev/training-simulator', { waitUntil: 'domcontentloaded' })
  await expect(
    page.getByText('Loading training simulator', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Start', exact: true }),
  ).toBeVisible()
})
