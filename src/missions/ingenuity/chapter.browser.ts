import { expect, test } from '@playwright/test'

test('Ingenuity full mission, resume, keyboard, shared outcomes and replay', async ({
  page,
}, info) => {
  const errors: string[] = []
  const missing: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('response', (response) => {
    if (
      response.url().includes('/assets/missions/ingenuity/') &&
      !response.ok()
    )
      missing.push(response.url())
  })
  await page.route(/\/(auth|rest)\/v1\//, (route) => route.abort())
  await page.goto('/?acceptance=training')
  const minimize = async () => {
    const control = page.getByRole('button', { name: 'Minimize dev banner' })
    if (await control.isVisible()) await control.click()
  }
  await minimize()
  await page.getByRole('link', { name: 'Begin Your Journey' }).click()
  await page.getByLabel('Choose Callsign').fill('Mars Flight Engineer')
  await page
    .getByRole('button', { name: 'Save Profile & Enter Mission Control' })
    .click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await page.goto('/missions/ingenuity')
  await minimize()
  await page.getByRole('link', { name: 'Start mission', exact: true }).click()
  const button = (name: string | RegExp) =>
    page.getByRole('button', { name, exact: typeof name === 'string' })
  const heading = (name: string) =>
    page.getByRole('heading', { name, level: 2, exact: true })
  const fits = async () =>
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  await button('Start').click()
  await expect(heading('What If We Could Fly on Mars?')).toBeVisible()
  await fits()
  await button('Begin Flight Training').click()
  for (const name of [
    /^1. Rotor blades/,
    /^2. Solar panel/,
    /^3. Navigation camera/,
    /^4. Battery and electronics/,
  ]) {
    await button(name).focus()
    await page.keyboard.press('Enter')
  }
  await page.getByText('View NASA’s aircraft anatomy diagram').click()
  await expect(page.getByAltText(/NASA diagram identifying/)).toBeVisible()
  await fits()
  await button('Finish aircraft inspection').click()
  await button('Run Test').click()
  await expect(
    page.getByText(/Insufficient lift in this demonstration/),
  ).toBeVisible()
  await page
    .getByLabel('Ingenuity’s larger, fast-spinning rotor design')
    .check()
  await button('Run Test').click()
  await button('Save flight lab findings').click()
  await expect(heading('Mission Control: Ready for Takeoff')).toBeVisible()
  await page.reload()
  await minimize()
  await expect(heading('Mission Control: Ready for Takeoff')).toBeVisible()
  for (const name of [
    'Battery prepared',
    'Rotor system ready',
    'Navigation system ready',
    'Landing area checked',
  ])
    await button(name).click()
  await button('Authorize Flight').click()
  await button('Check order').click()
  await expect(page.getByText(/That order is not right yet/)).toBeVisible()
  await button('Move Spin Up Rotors up').click()
  await button('Move Hover up').click()
  await button('Check order').click()
  await button('Execute Autonomous Flight').click()
  await button('Pause animation').click()
  await button('Next flight stage').click()
  await button('Next flight stage').click()
  await expect(page.getByText('3 m reference', { exact: true })).toBeVisible()
  await fits()
  await page.screenshot({
    path: info.outputPath('first-flight.png'),
    fullPage: true,
  })
  await button('Next flight stage').click()
  await button('Next flight stage').click()
  await button('Continue the journey').click()
  for (const name of ['Boulders', 'Sand ripples', 'Observation point'])
    await button(name).click()
  await page.getByLabel('Direct corridor through boulders').check()
  await page.getByLabel('Zone A — Large boulders').check()
  await button('Submit scouting plan').click()
  await expect(page.getByText(/That direct corridor crosses/)).toBeVisible()
  await page.getByLabel('Observation corridor around obstacles').check()
  await page.getByLabel('Zone C — Clear, textured terrain').check()
  await button('Submit scouting plan').click()
  await expect(
    page.getByAltText(/Relatively featureless sand ripples/),
  ).toBeVisible()
  await fits()
  await page.screenshot({
    path: info.outputPath('scouting.png'),
    fullPage: true,
  })
  await button('Save scouting plan').click()
  await page.getByLabel('Mars has no sunlight').check()
  await expect(
    page.getByText(/Try again. Mars receives sunlight/),
  ).toBeVisible()
  await page
    .getByLabel('Too few distinguishable surface features to track')
    .check()
  await button('Feature-rich terrain — many tracking points').click()
  await button('Enlarge rotor-shadow image').click()
  await expect(
    page.getByAltText(/Ingenuity’s color camera shows/),
  ).toBeVisible()
  await fits()
  await button('Show full image').click()
  await button('Inspect damaged rotor shadow').click()
  await page
    .getByLabel(
      'Reliable navigation and safe landings are essential for autonomous aircraft on unfamiliar terrain.',
    )
    .check()
  await button('Check engineering lesson').click()
  await button('Save Flight 72 discovery').click()
  await button(
    'Move Perseverance carries Ingenuity to Mars — February 18, 2021 up',
  ).click()
  await button(
    'Move Five-flight demonstration becomes an extended mission up',
  ).click()
  await button('Check order').click()
  await fits()
  await button('Complete Ingenuity mission').click()
  await expect(
    page.getByText('Chapter complete', { exact: true }),
  ).toBeVisible()
  await button('Start again').click()
  await expect(heading('What If We Could Fly on Mars?')).toBeVisible()
  await button('Next').click()
  await expect(heading('Meet the Little Helicopter That Could')).toBeVisible()
  await page.goto('/profile')
  await minimize()
  await expect(page.getByText('100 XP', { exact: true }).first()).toBeVisible()
  await page.goto('/journal')
  await minimize()
  await expect(
    page.getByText('The Final Flight of Ingenuity', { exact: true }),
  ).toBeVisible()
  await page.goto('/achievements')
  await minimize()
  await expect(page.getByText('Ingenuity story', { exact: true })).toBeVisible()
  expect(errors).toEqual([])
  expect(missing).toEqual([])
})
