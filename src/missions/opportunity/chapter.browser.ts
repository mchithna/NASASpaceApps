import { expect, test } from '@playwright/test'

test('Opportunity guest journey: play, refresh, retry, journal, achievement and replay', async ({
  page,
}, info) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route(/\/(auth|rest)\/v1\//, (route) => route.abort())
  await page.goto('/auth')
  await page.getByRole('button', { name: 'Minimize dev banner' }).click()
  await page
    .getByRole('button', { name: 'Enter Mission Control as Guest' })
    .click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await page.goto('/missions/opportunity')
  await page.getByRole('button', { name: 'Minimize dev banner' }).click()
  await page.getByRole('link', { name: 'Start mission', exact: true }).click()
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  const heading = (name: string) =>
    page.getByRole('heading', { name, level: 2, exact: true })
  const button = (name: string | RegExp) =>
    page.getByRole('button', { name, exact: typeof name === 'string' })
  const fits = async () =>
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  await expect(heading('The Day Mars Went Silent')).toBeVisible()
  await expect(button('Continue')).toBeDisabled()
  await button('Begin Investigation').click()
  await expect(heading('Meet Opportunity')).toBeVisible()
  for (const name of [
    'Panoramic Camera',
    'Microscopic Imager',
    'Solar panels',
  ]) {
    await button(`Inspect ${name}`).focus()
    await page.keyboard.press('Enter')
  }
  await fits()
  await button('Finish rover investigation').click()
  await button(/^Hematite-rich spheres/).click()
  await button(/^Sedimentary rock layers/).click()
  await page.getByLabel('Opportunity discovered living organisms.').check()
  await button('Check choice').click()
  await expect(page.getByText(/That choice is not right yet/)).toBeVisible()
  await page
    .getByLabel('Liquid water affected parts of Mars in the distant past.')
    .check()
  await button('Check choice').click()
  await button('Save water investigation').click()
  await expect(heading('The Journey Beyond Expectations')).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: 'Minimize dev banner' }).click()
  await expect(heading('The Journey Beyond Expectations')).toBeVisible()
  await expect(button(/2. Endurance Crater/)).toBeDisabled()
  for (const [target, destination] of [
    ['Inspect the outcrop', 'Endurance Crater'],
    ['Examine the rock layers', 'Victoria Crater'],
    ['Observe the crater wall', 'Endeavour Crater'],
    ['Open the investigation area', ''],
  ]) {
    await button(target!).click()
    await fits()
    if (destination) await button(`Travel to ${destination}`).click()
  }
  await page.screenshot({
    path: info.outputPath('expedition.png'),
    fullPage: true,
  })
  await button('Finish expedition').click()
  await button('Check matches').click()
  await expect(page.getByText(/Those matches are not right yet/)).toBeVisible()
  for (const [card, meaning] of [
    ['Hematite-rich spheres', /groundwater/],
    ['Gypsum veins', /Minerals deposited/],
    ['Clay-bearing rocks', /less acidic/],
  ] as const)
    await page
      .getByRole('group', { name: card })
      .getByRole('button', { name: meaning })
      .click()
  await button('Check matches').click()
  await button('Save scientific discovery').click()
  await expect(heading('When the Sunlight Disappeared')).toBeVisible()
  await expect(button('Finish storm investigation')).toBeDisabled()
  await page.getByRole('slider').focus()
  await page.keyboard.press('End')
  await expect(
    page.getByText('Insufficient for normal operations'),
  ).toBeVisible()
  await fits()
  await page.screenshot({ path: info.outputPath('storm.png'), fullPage: true })
  await button('Finish storm investigation').click()
  await expect(heading("The Explorer That Wouldn't Stop")).toBeVisible()
  await expect(button('Continue')).toBeDisabled()
  await button('Check order').click()
  await expect(page.getByText(/That order is not right yet/)).toBeVisible()
  await button('Move Landing at Eagle Crater up').click()
  await button('Move Exploring additional craters and Endeavour up').click()
  await button('Check order').click()
  await button('Finish the journey').click()
  await expect(
    page.getByText('Chapter complete', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText(/Martian Trailblazer unlocked/)).toBeVisible()
  for (const img of await page.locator('img').all())
    expect(
      await img.evaluate((node) => (node as HTMLImageElement).naturalWidth),
    ).toBeGreaterThan(0)
  await page.screenshot({ path: info.outputPath('legacy.png'), fullPage: true })
  await button('Start again').click()
  await button('Begin Investigation').click()
  await button('Exit mission').click()
  await page.goto('/profile')
  await expect(page.getByText('100', { exact: true }).first()).toBeVisible()
  await page.goto('/journal')
  await expect(
    page.getByText('The Ancient Water of Mars', { exact: true }),
  ).toBeVisible()
  await page.goto('/achievements')
  await expect(
    page.getByText('Martian Trailblazer', { exact: true }),
  ).toBeVisible()
  expect(errors).toEqual([])
})
