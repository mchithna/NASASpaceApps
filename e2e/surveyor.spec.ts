import { expect, test } from '@playwright/test'

test.setTimeout(120000)

test('Surveyor 3 starts from Play, retries, resumes, completes, and shares rewards without replay duplicates', async ({
  page,
}) => {
  let apiCalls = 0
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url())
    if (/\/(auth|rest)\/v1\//.test(url.pathname)) {
      apiCalls++
      return route.abort()
    }
    if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost')
      return route.abort()
    return route.continue()
  })
  await page.goto('/?acceptance=training', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Minimize dev banner' }).click()
  await page.getByRole('link', { name: 'Begin Your Journey' }).click()
  await page.getByLabel('Choose Callsign').fill('Lunar Investigator')
  await page
    .getByRole('button', { name: 'Save Profile & Enter Mission Control' })
    .click()
  await page.goto('/missions/surveyor-3', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Minimize dev banner' }).click()
  await page.getByRole('link', { name: 'Start mission', exact: true }).click()
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  const heading = (name: string) =>
    page.getByRole('heading', { level: 2, name, exact: true })
  await expect(heading('The Robot They Came Back For')).toBeVisible()
  await expect(
    page.getByRole('img', { name: /Pete Conrad beside Surveyor/ }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(heading('Meet Surveyor 3')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeDisabled()
  for (const name of [
    /1. TV camera/,
    /2. Surface sampler/,
    /3. Landing system/,
  ])
    await page.getByRole('button', { name }).click()
  await page.getByRole('button', { name: 'Open mission file' }).click()
  await page.getByRole('button', { name: 'Check order' }).click()
  await expect(page.getByText(/That order is not right yet/)).toBeVisible()
  await page
    .getByRole('button', { name: 'Move Descent toward the Moon up' })
    .focus()
  await page
    .getByRole('button', { name: 'Move Descent toward the Moon up' })
    .press('Enter')
  await page
    .getByRole('button', { name: 'Move First touchdown and bounce up' })
    .click()
  await page
    .getByRole('button', { name: 'Move First touchdown and bounce up' })
    .click()
  await page.getByRole('button', { name: 'Check order' }).click()
  await expect(heading('The Lunar Soil Investigation')).toBeVisible()
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Minimize dev banner' }).click()
  await expect(heading('The Lunar Soil Investigation')).toBeVisible()
  for (const name of [
    'Position arm',
    'Press the surface',
    'Dig a trench',
    'Inspect the evidence',
  ])
    await page.getByRole('button', { name, exact: true }).click()
  await page.getByLabel('The surface could not support a spacecraft.').check()
  await page.getByRole('button', { name: 'Submit investigation' }).click()
  await expect(page.getByRole('alert')).toContainText('Try again')
  await page
    .getByLabel(
      'The tested surface was firm enough to support an Apollo Lunar Module.',
    )
    .check()
  await page.getByRole('button', { name: 'Submit investigation' }).click()
  await expect(heading('The Last Transmission')).toBeVisible()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByLabel('The entire Surveyor 3 lander').check()
  await page.getByRole('button', { name: 'Check evidence' }).click()
  await expect(page.getByRole('alert')).toContainText('Look again')
  await page.getByLabel('The entire Surveyor 3 lander').uncheck()
  await page.getByLabel('TV camera system').check()
  await page.getByLabel('Surface sampler scoop').check()
  await page.getByRole('button', { name: 'Check evidence' }).click()
  await expect(heading("A Mission That Didn't End With Silence")).toBeVisible()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(
    page.getByText('Chapter complete', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText(/Lunar Archaeologist unlocked/)).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true)
  await page.screenshot({
    path: `test-results/surveyor-${test.info().project.name}.png`,
    fullPage: true,
  })
  await page.getByRole('button', { name: 'Exit mission' }).click()
  await expect(page.getByText('100 XP', { exact: true }).first()).toBeVisible()
  await page.goto('/journal', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Minimize dev banner' }).click()
  await expect(
    page.getByText('Surveyor 3: returned lunar hardware', { exact: true }),
  ).toBeVisible()
  await page.goto('/achievements', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Minimize dev banner' }).click()
  await expect(
    page.getByText('Lunar Archaeologist', { exact: true }),
  ).toBeVisible()
  await page.goto('/missions/surveyor-3', { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Minimize dev banner' }).click()
  await page.getByRole('link', { name: 'Replay mission', exact: true }).click()
  await page.getByRole('button', { name: 'Start again' }).click()
  await expect(heading('The Robot They Came Back For')).toBeVisible()
  await page.getByRole('button', { name: 'Exit mission' }).click()
  await expect(page.getByText('100 XP', { exact: true }).first()).toBeVisible()
  expect(apiCalls).toBe(0)
})
