import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url())
    if (
      /\/(auth|rest)\/v1\//.test(url.pathname) ||
      !['localhost', '127.0.0.1'].includes(url.hostname)
    )
      return route.abort()
    return route.continue()
  })
  await page.goto('/auth', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Minimize dev banner' }).click()
})

test('auth layout, keyboard tabs, password visibility and sign-in recovery', async ({
  page,
}, info) => {
  await expect(
    page.getByRole('heading', { name: 'Welcome back, explorer.' }),
  ).toBeVisible()
  const image = page.getByRole('img', { name: /A mosaic of Mars/ })
  await expect(image).toBeVisible()
  expect(
    await image.evaluate(
      (element) => (element as HTMLImageElement).naturalWidth,
    ),
  ).toBeGreaterThan(0)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  expect(
    await page
      .locator('figure')
      .evaluate(
        (figure) =>
          getComputedStyle(figure.querySelector('img')!.parentElement!)
            .animationName,
      ),
  ).toBe('none')
  await page.screenshot({ path: info.outputPath('signin.png'), fullPage: true })
  await page.getByRole('tab', { name: 'Sign In', exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'Create Account' })).toBeFocused()
  await expect(page).toHaveTitle('Create Account · NovaExplorer')
  await page.screenshot({
    path: info.outputPath('register.png'),
    fullPage: true,
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.keyboard.press('Home')
  await page.getByLabel('Academy Email').fill('incorrect@example.com')
  await page.getByLabel('Password', { exact: true }).fill('incorrect-password')
  await page.getByRole('button', { name: 'Show password' }).click()
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute(
    'type',
    'text',
  )
  await page.getByRole('button', { name: 'Hide password' }).click()
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText(
    'Those sign-in details do not match.',
  )
  await page
    .getByRole('button', { name: 'Fill Demo Account Credentials' })
    .click()
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(
    page.getByRole('heading', { name: 'Mission Control', exact: true }),
  ).toBeVisible()
})

test('registration saves callsign and avatar and opens Mission Control', async ({
  page,
}) => {
  await page.getByRole('tab', { name: 'Create Account' }).click()
  await page.getByLabel('Callsign / Nickname').fill('Orbit Cadet')
  await page.getByLabel('Academy Email').fill('orbit.cadet@example.com')
  await page
    .getByLabel('Password', { exact: true })
    .fill('example-password-123')
  await page.getByRole('radio', { name: 'Mars Rover Pilot' }).check()
  await expect(
    page.getByRole('radio', { name: 'Mars Rover Pilot' }),
  ).toBeChecked()
  await page.getByRole('button', { name: 'Register Profile & Begin' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(
    page.getByText('Orbit Cadet', { exact: true }).first(),
  ).toBeVisible()
})

test('guest access explains storage and opens Mission Control', async ({
  page,
}) => {
  await page.getByText('How is guest progress saved?', { exact: true }).click()
  await expect(
    page.getByText(
      /Creating an account does not transfer guest progress or rank/,
    ),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Enter Mission Control as Guest' })
    .click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(
    page.getByRole('heading', { name: 'Mission Control', exact: true }),
  ).toBeVisible()
})
