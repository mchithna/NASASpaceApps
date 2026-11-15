import { expect, test, type Page } from '@playwright/test'

test.setTimeout(180000)

async function open(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Minimize dev banner' }).click()
}

async function checkScreen(page: Page, name: string) {
  await expect(
    page.getByRole('heading', { level: 1, name, exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true)
  const images = page.locator('main img')
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded()
    await expect(image).toHaveJSProperty('complete', true)
    expect(
      await image.evaluate((node) => (node as HTMLImageElement).naturalWidth),
    ).toBeGreaterThan(0)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  const hero = page.locator('.platform-hero')
  if (await hero.count()) {
    await expect(hero).toHaveJSProperty('scrollLeft', 0)
    const heroBounds = await hero.boundingBox()
    const headingBounds = await hero
      .getByRole('heading', { level: 1 })
      .boundingBox()
    expect(headingBounds!.x).toBeGreaterThan(heroBounds!.x)
  }
  await page.screenshot({
    path: test
      .info()
      .outputPath(`${name.replaceAll(' ', '-').toLowerCase()}.png`),
    fullPage: true,
  })
}

test('academy pages share the home visual language and preserve learner flows', async ({
  page,
}) => {
  let apiAttempts = 0
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url())
    if (/\/(auth|rest)\/v1\//.test(url.pathname)) {
      apiAttempts++
      return route.abort()
    }
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) return route.abort()
    return route.continue()
  })
  await open(page, '/onboarding?acceptance=training')
  await checkScreen(page, 'Explorer Setup')
  await expect(page.locator('.observatory-sky')).toBeVisible()
  await expect(page.locator('.observatory-sky-photo')).toHaveCSS(
    'animation-name',
    'none',
  )
  await expect(
    page.getByRole('link', { name: /Night-sky photo/ }),
  ).toBeVisible()
  const setupPanel = page.locator('main .animate-page-rise').first()
  await expect(setupPanel).toHaveCSS('animation-name', 'none')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('.observatory-sky-photo')).not.toHaveCSS(
    'animation-name',
    'none',
  )
  await expect(setupPanel).not.toHaveCSS('animation-name', 'none')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByLabel('Choose Callsign').fill('Orbit Scout')
  await page.getByRole('radio', { name: /Mars Rover Pilot/ }).click()
  await page
    .getByRole('button', { name: 'Save Profile & Enter Mission Control' })
    .click()
  await checkScreen(page, 'Mission Control')
  const explorerHero = page.locator(
    'section[aria-labelledby="explorer-hero-name"]',
  )
  await expect(explorerHero).toHaveJSProperty('scrollLeft', 0)
  const explorerBounds = await explorerHero.boundingBox()
  const callsignBounds = await page.locator('#explorer-hero-name').boundingBox()
  expect(callsignBounds!.x).toBeGreaterThan(explorerBounds!.x)
  if (page.viewportSize()!.width < 1024) {
    const menu = page.getByRole('button', {
      name: 'Open navigation menu',
      exact: true,
    })
    await menu.click()
    await expect(
      page.getByRole('button', { name: 'Close navigation menu' }),
    ).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Escape')
    await expect(menu).toBeFocused()
  }
  await expect(
    page.getByRole('link', { name: /^Begin Story for / }),
  ).toHaveCount(5)
  if (page.viewportSize()!.width < 640) {
    await page
      .getByRole('button', { name: 'Open navigation menu', exact: true })
      .focus()
    await page.keyboard.press('Enter')
    await expect(
      page.getByRole('button', { name: 'Close navigation menu' }),
    ).toHaveAttribute('aria-expanded', 'true')
    await page
      .getByRole('navigation', { name: 'Main Navigation', exact: true })
      .getByRole('link', { name: 'Explorer Profile', exact: true })
      .click()
  } else {
    await page
      .getByRole('navigation', { name: 'Main Navigation', exact: true })
      .getByRole('link', { name: 'Explorer Profile', exact: true })
      .click()
  }
  await checkScreen(page, 'Explorer Profile')
  await page
    .getByLabel('Academy Callsign', { exact: true })
    .fill('Orbit Captain')
  await page.getByRole('button', { name: 'Save Changes' }).click()
  await expect(
    page.getByText('Explorer profile updated successfully.'),
  ).toBeVisible()
  await open(page, '/journal')
  await checkScreen(page, 'Discovery Journal')
  await expect(page.getByText('No Discoveries Logged Yet')).toBeVisible()
  await page
    .getByRole('button', { name: 'Surveyor 3 (0)', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Surveyor 3 (0)', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page.getByLabel('Search journal findings').fill('lunar')
  await page.getByLabel('Search journal findings').clear()
  await open(page, '/achievements')
  await checkScreen(page, 'Achievements')
  await expect(
    page.getByText('No Story Achievements Unlocked Yet'),
  ).toBeVisible()
  await open(page, '/missions/surveyor-3')
  await checkScreen(page, 'Surveyor 3')
  await page.getByRole('link', { name: 'Start mission', exact: true }).click()
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'The Robot They Came Back For',
    }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true)
  await page.screenshot({
    path: test.info().outputPath('mission-player.png'),
    fullPage: true,
  })
  await open(page, '/missions/pioneer-10')
  await checkScreen(page, 'Pioneer 10')
  await expect(
    page.getByText('Chapter In Development', { exact: true }),
  ).toBeVisible()
  await open(page, '/not-a-real-page')
  await checkScreen(page, 'Page not found')
  await open(page, '/auth')
  await checkScreen(page, 'Welcome back, explorer.')
  await page.getByRole('tab', { name: 'Create Account', exact: true }).click()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true)
  await page.screenshot({
    path: test.info().outputPath('create-account.png'),
    fullPage: true,
  })
  expect(apiAttempts).toBe(0)
})
